/**
 * The "blockchain" client/worker
 */

var blockchain = {
	name: "our babchain",
	consensus: "proof of stake",
	length: 0,
	blocks: []
};

var proposeBlock = (id, blockchain) => {
	var block = {
		creator: id,
		index: blockchain.length + 1,
		value: "dis new block"
	};
	blockchain.length = blockchain.length + 1;
    blockchain.blocks.push(block);
    // self.postMessage('NEW BLOCKCHAIN HEIGHT: ' + blockchain.blocks.length);
	self.postMessage({blockchain: blockchain});
	return blockchain
};

// receive other_blockchain, and replace with current if longer
// actually propagates the entire blockchain lmaoooOO
var propagateBlock = (other_blockchain) => {
	// new blockchain: user_blockchain
	// old blockchain: blockchain
	// self.postMessage('COMPARING BLOCKCHAINS');
	// self.postMessage('OTHER HEIGHT: ' + other_blockchain.length);
	// self.postMessage('OUR HEIGHT: ' + blockchain.length);

	var changed = false;
	if (other_blockchain.length > blockchain.length) {
		blockchain = other_blockchain;
		var from = blockchain.blocks[blockchain.blocks.length - 1].creator;
		changed = true;
	}
	self.postMessage({updated_blockchain: blockchain, changed: changed});
};


/**
 * start client with normalized power p
 */
var client_loop = (id, p) => {

    r = Math.random();
    if (r < p) {
        self.postMessage('PROPOSAL BY NODE ' + id + ' with power = ' + p);
        proposeBlock(id, blockchain);
    }

}

self.addEventListener('message', function(e) {
    if ('start_worker' in e.data) {
        id = e.data.start_worker.id;
        vot_pwr = e.data.start_worker.voting_power;
        // socket = e.data.start_worker.socket;

        // self.postMessage('Worker started with power: ' + vot_pwr);
        setInterval(() => client_loop(id, vot_pwr), 3000); // a block every 1s normalized
        // self.postMessage('LOOP');
    } else if ('propagate_block' in e.data) {
        propagateBlock(e.data.propagate_block.blockchain);
    } else if ('stop_worker' in e.data) {
        // self.postMessage('STOPPED WORKER');
        self.close();
    } else {
        // self.postMessage('INVALID MESSAGE IDK WHAT YOU"RE SAYING AHHHH');
    }
});
