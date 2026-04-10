#!/usr/bin/env python3
"""
Gato Returns Sync Service
=========================
Syncs returns, items, notes, history, products, and variations
from the Return Portal (return.gato-international.com) to
Live Odoo (office.gato-international.com) via XML-RPC.

Runs as a standalone cron/systemd service on this server.
Does NOT touch stock, orders, or customer records in Odoo.
"""

import xmlrpc.client
import requests
import json
import logging
import sys
import time
from datetime import datetime, timezone
from base64 import b64encode

# ─── Configuration ───
PORTAL_URL = "https://return.gato-international.com"
PORTAL_EMAIL = "admin@company.com"
PORTAL_PASSWORD = "Admin123!"

ODOO_URL = "https://office.gato-international.com"
ODOO_DB = "gato"
ODOO_USER = "it@gatosports.com"
ODOO_PASS = "Smart15game!"

# ─── Logging ───
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('/var/log/gato-returns-sync.log'),
    ]
)
log = logging.getLogger('gato-sync')

# ─── Portal API helpers ───
def get_portal_auth_header():
    """Basic auth header for portal API."""
    creds = b64encode(f"{PORTAL_EMAIL}:{PORTAL_PASSWORD}".encode()).decode()
    return {"Authorization": f"Basic {creds}", "Content-Type": "application/json"}

def portal_get(endpoint, params=None):
    """GET from portal API."""
    url = f"{PORTAL_URL}/api/v1/{endpoint}"
    headers = get_portal_auth_header()
    resp = requests.get(url, headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()

def portal_put(endpoint, data):
    """PUT to portal API."""
    url = f"{PORTAL_URL}/api/v1/{endpoint}"
    headers = get_portal_auth_header()
    resp = requests.put(url, headers=headers, json=data, timeout=30)
    resp.raise_for_status()
    return resp.json()

# ─── Odoo XML-RPC helpers ───
class OdooRPC:
    def __init__(self):
        self.uid = None
        self.models = None
        self._connect()

    def _connect(self):
        common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
        self.uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
        self.models = xmlrpc.client.ServerProxy(
            f'{ODOO_URL}/xmlrpc/2/object', allow_none=True)
        if not self.uid:
            raise Exception("Failed to authenticate with Odoo")
        log.info(f"Connected to Odoo as UID {self.uid}")

    def search(self, model, domain, **kwargs):
        return self.models.execute_kw(
            ODOO_DB, self.uid, ODOO_PASS, model, 'search', [domain], kwargs)

    def search_read(self, model, domain, fields=None, **kwargs):
        opts = kwargs.copy()
        if fields:
            opts['fields'] = fields
        return self.models.execute_kw(
            ODOO_DB, self.uid, ODOO_PASS, model, 'search_read', [domain], opts)

    def create(self, model, vals):
        return self.models.execute_kw(
            ODOO_DB, self.uid, ODOO_PASS, model, 'create', [vals])

    def write(self, model, ids, vals):
        return self.models.execute_kw(
            ODOO_DB, self.uid, ODOO_PASS, model, 'write', [ids, vals])

    def read(self, model, ids, fields=None):
        args = [ids]
        if fields:
            args.append(fields)
        return self.models.execute_kw(
            ODOO_DB, self.uid, ODOO_PASS, model, 'read', args)


# ─── Datetime helpers ───
def parse_datetime(dt_str):
    """Parse portal datetime to Odoo-compatible naive datetime string."""
    if not dt_str:
        return False
    # Remove timezone info for Odoo
    dt_str = dt_str.replace('T', ' ').replace('Z', '')
    if '+' in dt_str:
        dt_str = dt_str[:dt_str.index('+')]
    if '.' in dt_str:
        dt_str = dt_str[:dt_str.index('.')]
    return dt_str.strip()


# ─── Sync Functions ───
def sync_products(odoo):
    """Sync products and variations from portal to Odoo."""
    log.info("Syncing products...")
    
    try:
        data = portal_get("products")
    except Exception as e:
        log.error(f"Failed to fetch products: {e}")
        return
    
    products = data if isinstance(data, list) else data.get('data', data.get('products', []))
    log.info(f"Portal has {len(products)} products")
    
    for prod in products:
        portal_id = str(prod.get('id', ''))
        if not portal_id:
            continue
        
        # Check if product exists in Odoo
        existing = odoo.search('x_gato_return_product',
            [['x_portal_id', '=', portal_id]])
        
        vals = {
            'x_name': prod.get('name', 'Unknown Product'),
            'x_portal_id': portal_id,
            'x_sku': prod.get('sku', ''),
            'x_description': prod.get('description', ''),
            'x_price': float(prod.get('price', 0) or 0),
            'x_image_url': prod.get('image_url', ''),
            'x_active': prod.get('active', True),
            'x_portal_created': parse_datetime(prod.get('created_at', '')),
            'x_portal_updated': parse_datetime(prod.get('updated_at', '')),
        }
        
        if existing:
            odoo.write('x_gato_return_product', existing, vals)
        else:
            odoo_id = odoo.create('x_gato_return_product', vals)
            log.info(f"  Created product: {vals['x_name']} (Odoo ID: {odoo_id})")
        
        # Sync variations
        variations = prod.get('variations', [])
        if not variations:
            # Try fetching separately
            try:
                var_data = portal_get(f"products/{portal_id}/variations")
                variations = var_data if isinstance(var_data, list) else var_data.get('data', var_data.get('variations', []))
            except:
                variations = []
        
        product_odoo_id = existing[0] if existing else odoo_id
        
        for var in variations:
            var_portal_id = str(var.get('id', ''))
            if not var_portal_id:
                continue
            
            var_existing = odoo.search('x_gato_return_product_variation',
                [['x_portal_id', '=', var_portal_id]])
            
            # Build attributes text
            attrs = var.get('attributes', var.get('attribute_values', ''))
            if isinstance(attrs, dict):
                attrs = json.dumps(attrs)
            elif isinstance(attrs, list):
                attrs = ', '.join(str(a) for a in attrs)
            
            var_vals = {
                'x_name': var.get('name', var.get('sku', f'Var-{var_portal_id}')),
                'x_portal_id': var_portal_id,
                'x_product_id': product_odoo_id,
                'x_sku': var.get('sku', ''),
                'x_attributes': str(attrs) if attrs else '',
                'x_price': float(var.get('price', 0) or 0),
                'x_stock': int(var.get('stock', var.get('stock_quantity', 0)) or 0),
            }
            
            if var_existing:
                odoo.write('x_gato_return_product_variation', var_existing, var_vals)
            else:
                odoo.create('x_gato_return_product_variation', var_vals)
    
    total_products = len(odoo.search('x_gato_return_product', []))
    total_variations = len(odoo.search('x_gato_return_product_variation', []))
    log.info(f"Products sync done: {total_products} products, {total_variations} variations")


def sync_returns(odoo):
    """Sync returns, items, notes, and history from portal to Odoo."""
    log.info("Syncing returns...")
    
    try:
        data = portal_get("returns")
    except Exception as e:
        log.error(f"Failed to fetch returns: {e}")
        return
    
    returns = data if isinstance(data, list) else data.get('data', data.get('returns', []))
    log.info(f"Portal has {len(returns)} returns")
    
    now = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    
    for ret in returns:
        portal_id = str(ret.get('id', ''))
        if not portal_id:
            continue
        
        try:
            _sync_single_return(odoo, ret, portal_id, now)
        except Exception as e:
            log.error(f"Error syncing return {portal_id}: {e}")
            continue
    
    # Log summary
    total = len(odoo.search('x_gato_return', []))
    items = len(odoo.search('x_gato_return_item', []))
    history = len(odoo.search('x_gato_return_history', []))
    log.info(f"Returns sync done: {total} returns, {items} items, {history} history entries")


def _sync_single_return(odoo, ret, portal_id, now):
    """Sync a single return with its items, notes, and history."""
    
    # Check if return exists in Odoo
    existing = odoo.search('x_gato_return',
        [['x_portal_id', '=', portal_id]])
    
    vals = {
        'x_name': ret.get('return_number', ret.get('id', '')),
        'x_portal_id': portal_id,
        'x_status': (ret.get('status', 'pending') or 'pending').lower(),
        'x_customer_name': ret.get('customer_name', ''),
        'x_customer_email': ret.get('customer_email', ''),
        'x_customer_phone': ret.get('customer_phone', ''),
        'x_order_number': ret.get('order_number', ''),
        'x_reason': ret.get('reason', ''),
        'x_admin_notes': ret.get('admin_notes', ''),
        'x_refund_amount': float(ret.get('refund_amount', 0) or 0),
        'x_portal_created': parse_datetime(ret.get('created_at', '')),
        'x_portal_updated': parse_datetime(ret.get('updated_at', '')),
        'x_last_synced': now,
        'x_shipping_date': ret.get('shipping_date', False) or False,
        'x_order_verified': bool(ret.get('order_verified', False)),
        'x_vision_validated': bool(ret.get('vision_validated', False)),
        'x_preferred_resolution': ret.get('preferred_resolution', ''),
        'x_description': ret.get('description', ''),
    }
    
    if existing:
        return_odoo_id = existing[0]
        odoo.write('x_gato_return', existing, vals)
    else:
        return_odoo_id = odoo.create('x_gato_return', vals)
        log.info(f"  Created return: {vals['x_name']} ({vals['x_status']})")
    
    # ── Sync Items ──
    items = ret.get('items', ret.get('return_items', []))
    if items:
        _sync_return_items(odoo, return_odoo_id, items)
    
    # ── Sync from detail endpoint (for notes and history) ──
    try:
        detail = portal_get(f"returns/{portal_id}")
        detail_data = detail.get('data', detail) if isinstance(detail, dict) else detail
        
        # Sync notes
        notes = detail_data.get('notes', [])
        if notes:
            _sync_return_notes(odoo, return_odoo_id, notes)
        
        # Sync status history
        history = detail_data.get('status_history', detail_data.get('history', []))
        if history:
            _sync_return_history(odoo, return_odoo_id, history)
        
        # If items weren't in the list, try from detail
        if not items:
            detail_items = detail_data.get('items', detail_data.get('return_items', []))
            if detail_items:
                _sync_return_items(odoo, return_odoo_id, detail_items)
    except Exception as e:
        log.warning(f"  Could not fetch return detail {portal_id}: {e}")


def _sync_return_items(odoo, return_odoo_id, items):
    """Sync items for a specific return."""
    for item in items:
        item_portal_id = str(item.get('id', ''))
        if not item_portal_id:
            continue
        
        item_existing = odoo.search('x_gato_return_item',
            [['x_portal_id', '=', item_portal_id]])
        
        # Look up product/variation in Odoo
        product_odoo_id = False
        variation_odoo_id = False
        
        prod_portal_id = str(item.get('product_id', ''))
        if prod_portal_id:
            prod_match = odoo.search('x_gato_return_product',
                [['x_portal_id', '=', prod_portal_id]])
            if prod_match:
                product_odoo_id = prod_match[0]
        
        var_portal_id = str(item.get('variation_id', ''))
        if var_portal_id:
            var_match = odoo.search('x_gato_return_product_variation',
                [['x_portal_id', '=', var_portal_id]])
            if var_match:
                variation_odoo_id = var_match[0]
        
        item_vals = {
            'x_name': item.get('product_name', item.get('name', f'Item-{item_portal_id}')),
            'x_portal_id': item_portal_id,
            'x_return_id': return_odoo_id,
            'x_product_id': product_odoo_id,
            'x_variation_id': variation_odoo_id,
            'x_quantity': int(item.get('quantity', 1) or 1),
            'x_reason': item.get('reason', ''),
            'x_condition': item.get('condition', ''),
            'x_sku': item.get('sku', ''),
            'x_price': float(item.get('price', item.get('unit_price', 0)) or 0),
        }
        
        if item_existing:
            odoo.write('x_gato_return_item', item_existing, item_vals)
        else:
            odoo.create('x_gato_return_item', item_vals)
        
        # Sync images for this item
        images = item.get('images', [])
        if images:
            _sync_item_images(odoo, item_existing[0] if item_existing else
                odoo.search('x_gato_return_item', [['x_portal_id', '=', item_portal_id]])[0],
                images)


def _sync_item_images(odoo, item_odoo_id, images):
    """Sync images for a return item."""
    for img in images:
        img_portal_id = str(img.get('id', ''))
        if not img_portal_id:
            continue
        
        img_existing = odoo.search('x_gato_return_image',
            [['x_portal_id', '=', img_portal_id]])
        
        img_vals = {
            'x_name': img.get('filename', img.get('name', f'Image-{img_portal_id}')),
            'x_portal_id': img_portal_id,
            'x_item_id': item_odoo_id,
            'x_url': img.get('url', img.get('image_url', '')),
        }
        
        if img_existing:
            odoo.write('x_gato_return_image', img_existing, img_vals)
        else:
            odoo.create('x_gato_return_image', img_vals)


def _sync_return_notes(odoo, return_odoo_id, notes):
    """Sync notes for a return."""
    for note in notes:
        note_portal_id = str(note.get('id', ''))
        if not note_portal_id:
            continue
        
        note_existing = odoo.search('x_gato_return_note',
            [['x_portal_id', '=', note_portal_id]])
        
        note_vals = {
            'x_name': note.get('content', note.get('note', note.get('text', ''))),
            'x_portal_id': note_portal_id,
            'x_return_id': return_odoo_id,
            'x_author': note.get('author', note.get('created_by', '')),
            'x_is_internal': bool(note.get('is_internal', False)),
            'x_portal_created': parse_datetime(note.get('created_at', '')),
        }
        
        if note_existing:
            odoo.write('x_gato_return_note', note_existing, note_vals)
        else:
            odoo.create('x_gato_return_note', note_vals)


def _sync_return_history(odoo, return_odoo_id, history):
    """Sync status history for a return."""
    for entry in history:
        hist_portal_id = str(entry.get('id', ''))
        if not hist_portal_id:
            continue
        
        hist_existing = odoo.search('x_gato_return_history',
            [['x_portal_id', '=', hist_portal_id]])
        
        old_status = (entry.get('old_status', entry.get('from_status', '')) or '').lower()
        new_status = (entry.get('new_status', entry.get('to_status', '')) or '').lower()
        
        hist_vals = {
            'x_name': f"{old_status} → {new_status}" if old_status else new_status,
            'x_portal_id': hist_portal_id,
            'x_return_id': return_odoo_id,
            'x_old_status': old_status,
            'x_new_status': new_status,
            'x_changed_by': entry.get('changed_by', entry.get('created_by', '')),
            'x_notes': entry.get('notes', entry.get('reason', '')),
            'x_portal_created': parse_datetime(entry.get('created_at', '')),
        }
        
        if hist_existing:
            odoo.write('x_gato_return_history', hist_existing, hist_vals)
        else:
            odoo.create('x_gato_return_history', hist_vals)


def sync_status_changes_to_portal(odoo):
    """
    Push status changes made in Odoo back to the portal.
    Checks if Odoo status differs from portal status and pushes updates.
    """
    log.info("Checking for Odoo→Portal status changes...")
    
    # Get all returns from Odoo that have a portal_id
    returns = odoo.search_read('x_gato_return',
        [['x_portal_id', '!=', False]],
        fields=['x_portal_id', 'x_status', 'x_admin_notes'])
    
    changes = 0
    for ret in returns:
        portal_id = ret['x_portal_id']
        odoo_status = ret['x_status']
        
        try:
            portal_data = portal_get(f"returns/{portal_id}")
            portal_ret = portal_data.get('data', portal_data) if isinstance(portal_data, dict) else portal_data
            portal_status = (portal_ret.get('status', '') or '').lower()
            
            if odoo_status and portal_status and odoo_status != portal_status:
                log.info(f"  Pushing status change for {portal_id}: {portal_status} → {odoo_status}")
                portal_put(f"returns/{portal_id}/status", {
                    'status': odoo_status,
                    'notes': f'Status updated from Odoo by {ODOO_USER}',
                })
                changes += 1
        except Exception as e:
            log.warning(f"  Could not check/push status for {portal_id}: {e}")
    
    log.info(f"Status push done: {changes} changes")


# ─── Main ───
def run_sync():
    """Run a full sync cycle."""
    start = time.time()
    log.info("=" * 60)
    log.info("Starting sync cycle...")
    
    try:
        odoo = OdooRPC()
    except Exception as e:
        log.error(f"Failed to connect to Odoo: {e}")
        return
    
    # 1. Sync products first (needed for item references)
    try:
        sync_products(odoo)
    except Exception as e:
        log.error(f"Product sync failed: {e}")
    
    # 2. Sync returns (items, notes, history)
    try:
        sync_returns(odoo)
    except Exception as e:
        log.error(f"Returns sync failed: {e}")
    
    # 3. Push status changes from Odoo to portal
    try:
        sync_status_changes_to_portal(odoo)
    except Exception as e:
        log.error(f"Status push failed: {e}")
    
    elapsed = time.time() - start
    log.info(f"Sync cycle complete in {elapsed:.1f}s")
    log.info("=" * 60)


if __name__ == '__main__':
    if '--once' in sys.argv:
        run_sync()
    else:
        # Run continuously with interval
        interval = 300  # 5 minutes
        log.info(f"Starting sync loop (interval: {interval}s)")
        while True:
            try:
                run_sync()
            except Exception as e:
                log.error(f"Sync cycle error: {e}")
            time.sleep(interval)
