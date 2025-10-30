import bcrypt from "bcryptjs"

async function generateHash() {
  const password = "Admin123!"
  const hash = await bcrypt.hash(password, 10)
  console.log("Password hash for Admin123!:")
  console.log(hash)
  console.log("\nUse this hash in your SQL script.")
}

generateHash()
