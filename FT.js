const {
    Hbar,
    Client,
    PrivateKey,
    AccountBalanceQuery,
    TransferTransaction,
    AccountCreateTransaction,
    TokenCreateTransaction,
    TokenType,
    TokenSupplyType,
    TokenAssociateTransaction
  } = require("@hashgraph/sdk");
  require("dotenv").config();
  
  async function createFT() {
    // Grab your Hedera testnet account ID and private key from your .env file
    const myAccountId = process.env.MY_ACCOUNT_ID;
    const myPrivateKey = process.env.MY_PRIVATE_KEY;
    
    // 
  
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
  
    // Create new keys for treasury
    const treasuryPrivateKey = PrivateKey.generateED25519();
    const treasuryPublicKey = treasuryPrivateKey.publicKey;
  
    // Create a new account with 1,000 tinybar starting balance
    const newAccountTransactionResponse = await new AccountCreateTransaction()
      .setKey(treasuryPublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .execute(client);
  
    // Get the new account ID
    const getReceipt = await newAccountTransactionResponse.getReceipt(client);
    const treasuryId = getReceipt.accountId;
  
    console.log("\nNew Treasury account ID: " + treasuryId);
  
    // Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(treasuryId)
      .execute(client);
  
    console.log(
      "\nNew Treasury account balance is: " +
        accountBalance.hbars.toTinybars() +
        " tinybars."
    );
  


    // Create new keys for alice
    const alicePrivateKey = PrivateKey.generateED25519();
    const alicePublicKey = alicePrivateKey.publicKey;
  
    // Create a new account with 1,000 tinybar starting balance
    const alicePublicKeyTransactionResponse = await new AccountCreateTransaction()
      .setKey(alicePublicKey)
      .setInitialBalance(Hbar.fromTinybars(1000))
      .execute(client);
  
    // Get the new account ID
    const getReceiptalice = await alicePublicKeyTransactionResponse.getReceipt(client);
    const aliceId = getReceiptalice.accountId;
  
    console.log("\nNew Alice account ID: " + aliceId);
  
    // Verify the account balance
    const accountBalancealice = await new AccountBalanceQuery()
      .setAccountId(aliceId)
      .execute(client);
  
    console.log(
      "\nNew Alice account balance is: " +
        accountBalancealice.hbars.toTinybars() +
        " tinybars."
    );


    //CREATE SUPPLY KEY
    const supplyKey = PrivateKey.generate();


    //CREATE FUNGIBLE TOKEN (STABLECOIN)
    let tokenCreateTx = await new TokenCreateTransaction()
      .setTokenName("PEEPO")
      .setTokenSymbol("PEP")
      .setTokenType(TokenType.FungibleCommon)
      .setDecimals(2)
      .setInitialSupply(10000) // in decimals
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Infinite)
      .setSupplyKey(supplyKey)
      .freezeWith(client);



      //not specifying an admin key, makes a token immutable (can’t change or add properties); 
      //not specifying a supply key, makes a token supply fixed (can’t mint new or burn existing tokens); 
      //not specifying a token type, makes a token fungible.


    let tokenCreateSign = await tokenCreateTx.sign(treasuryPrivateKey);
    let tokenCreateSubmit = await tokenCreateSign.execute(client);
    let tokenCreateRx = await tokenCreateSubmit.getReceipt(client);
    let tokenId = tokenCreateRx.tokenId;
    console.log(`- Created token with ID: ${tokenId} \n`);





    //TOKEN ASSOCIATION WITH ALICE's ACCOUNT
    let associateAliceTx = await new TokenAssociateTransaction()
      .setAccountId(aliceId)
      .setTokenIds([tokenId])
      .freezeWith(client)
      .sign(alicePrivateKey);
    let associateAliceTxSubmit = await associateAliceTx.execute(client);
    let associateAliceRx = await associateAliceTxSubmit.getReceipt(client);
    console.log(`- Token association with Alice's account: ${associateAliceRx.status} \n`);
	
  
    //BALANCE CHECK BEFORE TRANSFER
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(aliceId).execute(client);
    console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);

	
    //TRANSFER STABLECOIN FROM TREASURY TO ALICE
    let tokenTransferTx = await new TransferTransaction()
      .addTokenTransfer(tokenId, treasuryId, -5)
      .addTokenTransfer(tokenId, aliceId, 5)
      .freezeWith(client)
      .sign(treasuryPrivateKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(`\n- Stablecoin transfer from Treasury to Alice: ${tokenTransferRx.status} \n`);



    //BALANCE CHECK AFTER TRANSFER
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(treasuryId).execute(client);
    console.log(`- Treasury balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);
    var balanceCheckTx = await new AccountBalanceQuery().setAccountId(aliceId).execute(client);
    console.log(`- Alice's balance: ${balanceCheckTx.tokens._map.get(tokenId.toString())} units of token ID ${tokenId}`);



  }
  createFT();