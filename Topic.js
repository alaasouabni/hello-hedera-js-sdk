const {
    Hbar,
    Client,
    TopicCreateTransaction,
    TopicMessageQuery,
    TopicMessageSubmitTransaction
} = require("@hashgraph/sdk")
require("dotenv").config();

async function topic() {
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









    // Create a new topic - Creating a topic only costs you $0.01
    let txResponse = await new TopicCreateTransaction().execute(client);

    // Grab the newly generated topic ID
    let receipt = await txResponse.getReceipt(client);
    let topicId = receipt.topicId;
    console.log(`Your topic ID is: ${topicId}`);

    // Wait 5 seconds between consensus topic creation and subscription creation
    await new Promise((resolve) => setTimeout(resolve, 5000));





    // Subscribe to the topic - Subscribing to a topic via a Hedera mirror node allows you to receive the stream of messages that are being submitted to it.
    // The Hedera Testnet client already establishes a connection to a Hedera mirror node.
    new TopicMessageQuery()
        .setTopicId(topicId)
        .subscribe(client, null, (message) => {
            let messageAsString = Buffer.from(message.contents, "utf8").toString();
            console.log(
                `${message.consensusTimestamp.toDate()} Received: ${messageAsString}`
            );
        });


    
    
    
    
    
    // Send message to the topic - Each message you send to a topic costs you $0.0001 ==> 10,000 messages = $1
    let sendResponse = await new TopicMessageSubmitTransaction({
        topicId: topicId,
        message: "Hello, HCS!",
    }).execute(client);

    // Get the receipt of the transaction
    const getReceipt = await sendResponse.getReceipt(client);

    // Get the status of the transaction
    const transactionStatus = getReceipt.status
    console.log("The message transaction status " + transactionStatus.toString())

}

topic();