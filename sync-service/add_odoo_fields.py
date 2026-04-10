#!/usr/bin/env python3
"""
Add new fields to x_gato_return model in Odoo.
Run once to create the fields, then the sync service will populate them.

Usage:
    python3 add_odoo_fields.py
"""

import xmlrpc.client

ODOO_URL = "https://office.gato-international.com"
ODOO_DB = "gato"
ODOO_USER = "it@gatosports.com"
ODOO_PASS = "Smart15game!"

def main():
    print("Connecting to Odoo...")
    common = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/common')
    uid = common.authenticate(ODOO_DB, ODOO_USER, ODOO_PASS, {})
    if not uid:
        print("ERROR: Failed to authenticate")
        return
    
    models = xmlrpc.client.ServerProxy(f'{ODOO_URL}/xmlrpc/2/object', allow_none=True)
    print(f"Connected as UID {uid}")

    # Get model ID for x_gato_return
    model_ids = models.execute_kw(ODOO_DB, uid, ODOO_PASS,
        'ir.model', 'search', [[['model', '=', 'x_gato_return']]])
    
    if not model_ids:
        print("ERROR: x_gato_return model not found")
        return
    
    model_id = model_ids[0]
    print(f"Found x_gato_return model (ID: {model_id})")

    # Fields to add
    new_fields = [
        {
            'name': 'x_shipping_date',
            'field_description': 'Shipping Date',
            'ttype': 'date',
            'model_id': model_id,
        },
        {
            'name': 'x_order_verified',
            'field_description': 'Order Verified',
            'ttype': 'boolean',
            'model_id': model_id,
        },
        {
            'name': 'x_vision_validated',
            'field_description': 'Vision Validated',
            'ttype': 'boolean',
            'model_id': model_id,
        },
        {
            'name': 'x_preferred_resolution',
            'field_description': 'Preferred Resolution',
            'ttype': 'char',
            'model_id': model_id,
        },
        {
            'name': 'x_description',
            'field_description': 'Description',
            'ttype': 'text',
            'model_id': model_id,
        },
    ]

    for field_def in new_fields:
        # Check if field already exists
        existing = models.execute_kw(ODOO_DB, uid, ODOO_PASS,
            'ir.model.fields', 'search', [[
                ['model_id', '=', model_id],
                ['name', '=', field_def['name']]
            ]])
        
        if existing:
            print(f"  Field {field_def['name']} already exists, skipping")
            continue
        
        try:
            field_id = models.execute_kw(ODOO_DB, uid, ODOO_PASS,
                'ir.model.fields', 'create', [field_def])
            print(f"  Created field {field_def['name']} (ID: {field_id})")
        except Exception as e:
            print(f"  ERROR creating {field_def['name']}: {e}")

    print("\nDone! New fields added to x_gato_return model.")


if __name__ == '__main__':
    main()
