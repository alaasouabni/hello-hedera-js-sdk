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
    TokenAssociateTransaction,
    TokenMintTransaction
  } = require("@hashgraph/sdk");
  require("dotenv").config();
  
  async function createNFT() {
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
  
    console.log("\nNew account ID: " + treasuryId);
  
    // Verify the account balance
    const accountBalance = await new AccountBalanceQuery()
      .setAccountId(treasuryId)
      .execute(client);
  
    console.log(
      "\nNew account balance is: " +
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
  
    console.log("\nNew account ID: " + aliceId);
  
    // Verify the account balance
    const accountBalancealice = await new AccountBalanceQuery()
      .setAccountId(aliceId)
      .execute(client);
  
    console.log(
      "\nNew account balance is: " +
        accountBalancealice.hbars.toTinybars() +
        " tinybars."
    );



    const supplyKey = PrivateKey.generate();


    //Create the NFT Collection
    const nftCreate = await new TokenCreateTransaction()
      .setTokenName("diploma")
      .setTokenSymbol("GRAD")
      .setTokenType(TokenType.NonFungibleUnique)
      .setDecimals(0)
      .setInitialSupply(0)
      .setTreasuryAccountId(treasuryId)
      .setSupplyType(TokenSupplyType.Finite)
      .setMaxSupply(250)
      .setSupplyKey(supplyKey)
      .freezeWith(client);

    //Sign the transaction with the treasury key
    const nftCreateTxSign = await nftCreate.sign(treasuryPrivateKey);

    //Submit the transaction to a Hedera network
    const nftCreateSubmit = await nftCreateTxSign.execute(client);

    //Get the transaction receipt
    const nftCreateRx = await nftCreateSubmit.getReceipt(client);

    //Get the token ID
    const tokenId = nftCreateRx.tokenId;

    //Log the token ID
    console.log(`\nCreated NFT with Token ID: ` + tokenId);




    //IPFS content identifiers for which we will create a NFT
    const CID = [
      Buffer.from(
        "ipfs://bafybeihlsozaqhl7g3htrdyxp64ugf4uimhovxtfkwjblxko57stm5ixpy" //https://ipfs.io/ipfs/QmeCF98voAAMgVFLbfBi9vBh8vRmGHrSKuk9ZrSYu6xYoF
      ),
      Buffer.from(
        "ipfs://bafyreic463uarchq4mlufp7pvfkfut7zeqsqmn3b2x3jjxwcjqx6b5pk7q/metadata.json"
      ),
      Buffer.from(
        "ipfs://bafyreihhja55q6h2rijscl3gra7a3ntiroyglz45z5wlyxdzs6kjh2dinu/metadata.json"
      ),
      Buffer.from(
        "ipfs://bafyreidb23oehkttjbff3gdi4vz7mjijcxjyxadwg32pngod4huozcwphu/metadata.json"
      ),
      Buffer.from(
        "ipfs://bafyreie7ftl6erd5etz5gscfwfiwjmht3b52cevdrf7hjwxx5ddns7zneu/metadata.json"
      ),
    ];

    // Max transaction fee as a constant
    const maxTransactionFee = new Hbar(20);



    // MINT NEW BATCH OF NFTs
    const mintTx = new TokenMintTransaction()
      .setTokenId(tokenId)
      .setMetadata(CID) //Batch minting - UP TO 10 NFTs in single tx
      .setMaxTransactionFee(maxTransactionFee)
      .freezeWith(client);

    //Sign the transaction with the supply key
    const mintTxSign = await mintTx.sign(supplyKey);

    //Submit the transaction to a Hedera network
    const mintTxSubmit = await mintTxSign.execute(client);

    //Get the transaction receipt
    const mintRx = await mintTxSubmit.getReceipt(client);

    //Log the serial number
    console.log(
      "Created NFT " + tokenId + " with serial number: " + mintRx.serials + "\n"
    );


    //TOKEN ASSOCIATION WITH ALICE's ACCOUNT
    let associateAliceTx = await new TokenAssociateTransaction()
      .setAccountId(aliceId)
      .setTokenIds([tokenId])
      .freezeWith(client)
      .sign(alicePrivateKey);
    let associateAliceTxSubmit = await associateAliceTx.execute(client);
    let associateAliceRx = await associateAliceTxSubmit.getReceipt(client);
    
    
    //Confirm the transaction was successful
    console.log(
      `NFT association with Alice's account: ${associateAliceRx.status}\n`
    );
	


    // Check the balance before the transfer for the treasury account
    var balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(treasuryId)
      .execute(client);
    console.log(
      `Treasury balance: ${balanceCheckTx.tokens._map.get(
        tokenId.toString()
      )} NFTs of ID ${tokenId}`
    );

    // Check the balance before the transfer for Alice's account
    var balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(aliceId)
      .execute(client);
    console.log(
      `Alice's balance: ${balanceCheckTx.tokens._map.get(
        tokenId.toString()
      )} NFTs of ID ${tokenId}`
    );

	
    //TRANSFER NFT FROM TREASURY TO ALICE
    let tokenTransferTx = await new TransferTransaction()
      .addNftTransfer(tokenId, 1, treasuryId, aliceId)
      .freezeWith(client)
      .sign(treasuryPrivateKey);
    let tokenTransferSubmit = await tokenTransferTx.execute(client);
    let tokenTransferRx = await tokenTransferSubmit.getReceipt(client);
    console.log(
      `\nNFT transfer from Treasury to Alice: ${tokenTransferRx.status} \n`
    );



    // Check the balance after the transfer for the treasury account
    var balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(treasuryId)
      .execute(client);
    console.log(
      `Treasury balance: ${balanceCheckTx.tokens._map.get(
        tokenId.toString()
      )} NFTs of ID ${tokenId}`
    );

    // Check the balance after the transfer for Alice's account
    var balanceCheckTx = await new AccountBalanceQuery()
      .setAccountId(aliceId)
      .execute(client);
    console.log(
      `Alice's balance: ${balanceCheckTx.tokens._map.get(
        tokenId.toString()
      )} NFTs of ID ${tokenId}`
    );



  }
  createNFT();