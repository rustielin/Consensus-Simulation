var blockchain = {
	name: "our babchain",
	consensus: "proof of stake",
	length: 0,
	blocks: [],
	createBlock: function() {
		var block = { 
			index: this.length + 1,
			value: "dis new block"
		},
		this.length = this.length + 1,
		this.blocks.push(block)
		return block
	}
};


