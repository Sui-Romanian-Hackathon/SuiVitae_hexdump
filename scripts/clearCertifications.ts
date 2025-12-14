/**
 * Script to remove all certifications/diplomas owned by a specific address
 * 
 * Usage:
 *   bun run scripts/clearCertifications.ts
 * 
 * This script will:
 * 1. Query all Diploma objects owned by the target address
 * 2. Attempt to delete/transfer them (depending on contract capabilities)
 */

import { SuiClient, getFullnodeUrl } from "@mysten/sui/client";
import { Transaction } from "@mysten/sui/transactions";
import { Ed25519Keypair } from "@mysten/sui/keypairs/ed25519";
import { PACKAGE_ID, MODULE_NAME, ADMIN_CAP_ID, NETWORK } from "../src/constants";

// Target address to clear
const TARGET_ADDRESS = "0xf97e5a1a051c190b2977b5770746b0b3b723fc6cd870c187200c416d003e81f5";

// Initialize Sui client
const client = new SuiClient({
  url: getFullnodeUrl(NETWORK),
});

// Get the private key from environment variable
// You can use either:
// 1. TARGET_PRIVATE_KEY - private key for the target address (recommended)
// 2. ADMIN_PRIVATE_KEY - admin private key (only works if admin owns the objects)
const TARGET_PRIVATE_KEY = process.env.TARGET_PRIVATE_KEY;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

if (!TARGET_PRIVATE_KEY && !ADMIN_PRIVATE_KEY) {
  console.error("❌ TARGET_PRIVATE_KEY or ADMIN_PRIVATE_KEY environment variable is required");
  console.error("   Set TARGET_PRIVATE_KEY in your .env file (recommended)");
  console.error("   Or set ADMIN_PRIVATE_KEY if admin owns the objects");
  console.error("   Example: export TARGET_PRIVATE_KEY=your_private_key_hex");
  process.exit(1);
}

// Use target private key if available, otherwise use admin key
const privateKey = TARGET_PRIVATE_KEY || ADMIN_PRIVATE_KEY!;
const keypair = Ed25519Keypair.fromSecretKey(
  Buffer.from(privateKey, "hex")
);

console.log(`🔑 Using keypair for address: ${keypair.toSuiAddress()}`);

async function clearAllCertifications() {
  try {
    console.log(`🔍 Querying all Diploma objects owned by: ${TARGET_ADDRESS}`);
    
    // Query all Diploma objects owned by the target address
    const ownedObjects = await client.getOwnedObjects({
      owner: TARGET_ADDRESS,
      filter: {
        StructType: `${PACKAGE_ID}::${MODULE_NAME}::Diploma`,
      },
      options: {
        showType: true,
        showContent: true,
        showOwner: true,
      },
    });

    console.log(`📦 Found ${ownedObjects.data.length} Diploma object(s)`);

    if (ownedObjects.data.length === 0) {
      console.log("✅ No certifications found. Address is already clear.");
      return;
    }

    // Display found objects
    console.log("\n📋 Found Diplomas:");
    ownedObjects.data.forEach((obj, index) => {
      console.log(`  ${index + 1}. Object ID: ${obj.data?.objectId}`);
      if (obj.data?.content && "fields" in obj.data.content) {
        const fields = obj.data.content.fields as any;
        console.log(`     Title: ${fields.course_name || "N/A"}`);
        console.log(`     Issuer: ${fields.issuer_name || "N/A"}`);
      }
    });

    // In Sui, objects can be removed by:
    // 1. Transferring to a burn address (0x000...000) - if object is transferable
    // 2. Using a contract delete/burn function - if the contract has one
    // 3. The object owner can transfer it themselves
    
    console.log("\n🔧 Attempting to remove objects...");
    
    // Option 1: Try to transfer to burn address
    const BURN_ADDRESS = "0x0000000000000000000000000000000000000000000000000000000000000000";
    
    let successCount = 0;
    let failCount = 0;
    
    for (const obj of ownedObjects.data) {
      if (!obj.data?.objectId) continue;
      
      const objectId = obj.data.objectId;
      console.log(`\n🔄 Processing object: ${objectId}`);
      
      try {
        // First, try to transfer to burn address
        // Note: This only works if the object is owned by the signer
        // Since we're using admin keypair, we can only transfer if admin owns them
        // OR if the objects are owned by the target address, we need that address's keypair
        
        // For now, we'll try with admin keypair (might fail if admin doesn't own them)
        const tx = new Transaction();
        
        tx.transferObjects(
          [tx.object(objectId)],
          BURN_ADDRESS
        );
        
        const result = await client.signAndExecuteTransaction({
          signer: keypair,
          transaction: tx,
          options: {
            showEffects: true,
            showEvents: true,
          },
        });
        
        console.log(`   ✅ Transferred to burn address`);
        console.log(`   📝 Transaction: ${result.digest}`);
        successCount++;
      } catch (error: any) {
        console.error(`   ❌ Transfer failed:`, error.message);
        failCount++;
        
        // If transfer fails, the object might:
        // 1. Not be owned by the admin keypair
        // 2. Not be transferable
        // 3. Need to be deleted via contract function
        
        console.log(`   💡 Note: To remove objects owned by ${TARGET_ADDRESS}, you need:`);
        console.log(`      1. The private key for that address, OR`);
        console.log(`      2. A contract function that allows admin to delete objects`);
      }
    }
    
    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully removed: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    
    if (failCount > 0) {
      console.log(`\n⚠️  Some objects could not be removed.`);
      console.log(`   You may need to:`);
      console.log(`   1. Use the private key for address ${TARGET_ADDRESS}`);
      console.log(`   2. Check if the contract has a delete/burn function`);
      console.log(`   3. Transfer objects manually using Sui Explorer or CLI`);
    }
    
    console.log("\n✅ Script completed!");
    console.log("   Note: Some objects might not be transferable. Check the contract for delete/burn functions.");
    
  } catch (error) {
    console.error("❌ Error clearing certifications:", error);
    throw error;
  }
}

// Run the script
clearAllCertifications()
  .then(() => {
    console.log("\n✨ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n💥 Script failed:", error);
    process.exit(1);
  });

