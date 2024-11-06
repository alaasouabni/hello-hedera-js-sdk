const {
    Hbar,
    Client,
    PrivateKey,
    AccountCreateTransaction,
    AccountBalanceQuery,
    TransferTransaction,
    AccountId
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
  
  
    // Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);
  
    console.log(
      "New account balance is: " +
        accountBalance.hbars.toTinybars() +
        " tinybars."
    );

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
  
  
    // Verify the account balance
    const accountBalance2 = await new AccountBalanceQuery()
      .setAccountId(newAccountId2)
      .execute(client);
  
    console.log(
      "New account 2 balance is: " +
        accountBalance2.hbars.toTinybars() +
        " tinybars."
    );
  

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
  
  
    // Verify the account balance
    const accountBalance3 = await new AccountBalanceQuery()
      .setAccountId(newAccountId3)
      .execute(client);
  
    console.log(
      "New account 3 balance is: " +
        accountBalance3.hbars.toTinybars() +
        " tinybars."
    );
  //The node account ID to submit the transaction to. You can add more than 1 node account ID to the list
  const nodeId = [];
  nodeId.push(new AccountId(3));

  //Create the transfer transaction
  const transferTransaction = new TransferTransaction()
      .addHbarTransfer(newAccountId, Hbar.fromTinybars(-100))
      .addHbarTransfer(myAccountId, Hbar.fromTinybars(100))
      .setNodeAccountIds(nodeId);

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
  console.log("The public keys that signed the transaction  " +signedTransaction.getSignatures());


  //Submit the transaction to a Hedera network
  const submitTx = await signedTransaction.execute(client);

  //Get the transaction ID
  const txId = submitTx.transactionId.toString();

  //Print the transaction ID to the console
  console.log("The transaction ID " +txId);


      // Verify the account balance
  const accountBalanceAfter = await new AccountBalanceQuery()
      .setAccountId(newAccountId)
      .execute(client);
  
    console.log(
      "New account balance is: " +
        accountBalanceAfter.hbars.toTinybars() +
        " tinybars."
    );
  }
  multisig();