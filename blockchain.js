var blockchain = {
	name: "our babchain",
	consensus: "proof of stake",
	length: 0,
	blocks: [],
};

var proposeBlock = (blockchain) => {
	var block = {
		creator: msg.sender,
		index: blockchain.length + 1,
		value: "dis new block"
	};
	blockchain.length = blockchain.length + 1;
	blockchain.blocks.push(block);
	return blockchain
};

var propagateBlock = (other_blockchain) => {
	// new blockchain: user_blockchain
	// old blockchain: blockchain
	if (other_blockchain.length > blockchain.length) {
		blockchain = other_blockchain;
		peers.foreach(peer => {
			socket.emit('received_blockchain', blockchain);
		});
	} 
};