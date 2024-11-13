const {
  Hbar,
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  TransferTransaction,
  AccountId,
  KeyList
} = require("@hashgraph/sdk")
require("dotenv").config();

async function multisig() {
  // Grab your Hedera testnet account ID and private key from your .env file
  const myAccountId = process.env.MY_ACCOUNT_ID;
  const myPrivateKey = process.env.MY_PRIVATE_KEY;

  // If we weren't able to grab it, we should throw a new error
  if (myAccountId == null || myPrivateKey == null) {
    throw new Error(
      "Environment variables myAccountId and myPrivateKey must be present"
    );
  }

  // Create your connection to the Hedera network
  const client = Client.forTestnet();

  //Set your account as the client's operator
  client.setOperator(myAccountId, myPrivateKey);

  // Set default max transaction fee & max query payment
  client.setDefaultMaxTransactionFee(new Hbar(100));
  client.setDefaultMaxQueryPayment(new Hbar(50));

  console.log("Client setup complete.");

  //!.......................Create New Account........................!

  // Create new keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  // Create a new account with 1,000 tinybar starting balance
  const newAccountTransactionResponse = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID
  const getReceipt = await newAccountTransactionResponse.getReceipt(client);
  const newAccountId = getReceipt.accountId;

  console.log("\nNew account ID: " + newAccountId);




  const newAccountPrivateKey2 = PrivateKey.generateED25519();
  const newAccountPublicKey2 = newAccountPrivateKey2.publicKey;

  // Create a new account with 1,000 tinybar starting balance
  const newAccountTransactionResponse2 = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey2)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID
  const getReceipt2 = await newAccountTransactionResponse2.getReceipt(client);
  const newAccountId2 = getReceipt2.accountId;

  console.log("\nNew account ID 2: " + newAccountId2);




  const newAccountPrivateKey3 = PrivateKey.generateED25519();
  const newAccountPublicKey3 = newAccountPrivateKey3.publicKey;

  // Create a new account with 1,000 tinybar starting balance
  const newAccountTransactionResponse3 = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey3)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID
  const getReceipt3 = await newAccountTransactionResponse3.getReceipt(client);
  const newAccountId3 = getReceipt3.accountId;

  console.log("\nNew account ID 3: " + newAccountId3);




  // Create a key list with the new accounts public keys
  const keyList = new KeyList([newAccountPublicKey, newAccountPublicKey2, newAccountPublicKey3]);

  // Create the shared account with the key list
  const createSharedAccountTx = await new AccountCreateTransaction()
    .setKey(keyList)
    .setInitialBalance(Hbar.fromTinybars(1000))
    .execute(client);

  // Get the new account ID
  const getSharedReceipt = await createSharedAccountTx.getReceipt(client);
  const newSharedAccountId = getSharedReceipt.accountId;

  console.log("\nNew Shared Account ID: " + newSharedAccountId);



  // Verify the account balance
  const sharedAccountBalance = await new AccountBalanceQuery()
    .setAccountId(newSharedAccountId)
    .execute(client);

  console.log(
    "New Shared account balance is: " +
    sharedAccountBalance.hbars.toTinybars() +
    " tinybars."
  );

  //The node account ID to submit the transaction to. You can add more than 1 node account ID to the list
  const nodeId = [];
  nodeId.push(new AccountId(3)); //0.0.3





  //Create the transfer transaction
  const transferTransaction = new TransferTransaction()
    .addHbarTransfer(newSharedAccountId, Hbar.fromTinybars(-100))
    .addHbarTransfer(myAccountId, Hbar.fromTinybars(100))
    .setNodeAccountIds(nodeId);


  // const transactionScheduled = new ScheduleCreateTransaction()
  //   .setScheduledTransaction(transferTransaction)
  //   .setNodeAccountIds(nodeId);

  //Freeze the transaction from further modifications
  const transaction = await transferTransaction.freezeWith(client);


  //Signer one signs the transaction with their private key
  const signature1 = newAccountPrivateKey.signTransaction(transaction);

  //Signer two signs the transaction with their private key
  const signature2 = newAccountPrivateKey2.signTransaction(transaction);

  //Signer three signs the transaction with their private key
  const signature3 = newAccountPrivateKey3.signTransaction(transaction);


  //Collate all three signatures with the transaction
  const signedTransaction = transaction.addSignature(newAccountPublicKey, signature1).addSignature(newAccountPublicKey2, signature2).addSignature(newAccountPublicKey3, signature3);


  //Print all public keys that signed the transaction
  console.log("The public keys that signed the transaction  " + signedTransaction.getSignatures());


  //Submit the transaction to a Hedera network
  const submitTx = await signedTransaction.execute(client);

  //Get the transaction ID
  const txId = submitTx.transactionId.toString();

  //Print the transaction ID to the console
  console.log("The transaction ID " + txId);


  //Delay for a few seconds to ensure the transaction is complete
  function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  console.log("Start");
  await delay(2000); // 2-second delay
  console.log("Delayed");
  console.log("End");



  // Verify the account balance
  const accountBalanceAfter = await new AccountBalanceQuery()
    .setAccountId(newSharedAccountId)
    .execute(client);

  console.log(
    "New Shared account balance is: " +
    accountBalanceAfter.hbars.toTinybars() +
    " tinybars."
  );
}
multisig();