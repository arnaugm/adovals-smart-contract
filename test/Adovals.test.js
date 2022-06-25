const { expect } = require('chai');
const { ethers } = require('hardhat');
const { BigNumber } = require('ethers');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

describe('Adovals contract', () => {
  let Adovals;
  let hardhatToken;
  let tokenNoOwner;
  let owner;
  let addr1;
  let addr2;
  let addr3;
  let addr4;
  let addr5;
  let addr6;
  let addr7;
  let notWhitelistedAddr;
  let whitelist;
  let ownerWhitelist;
  let merkleTree;
  let ownerMerkleTree;
  let merkleRoot;
  let ownerMerkleRoot;
  let addr1Proof;
  let addr2Proof;
  let ownerAddrProof;

  before(async () => {
    const generateMerkleTrees = (addresses) => {
      const leaves = addresses.map((addr) => keccak256(addr));

      merkleTree = new MerkleTree(leaves.slice(1), keccak256, {
        sortPairs: true,
      });
      ownerMerkleTree = new MerkleTree(leaves, keccak256, { sortPairs: true });

      merkleRoot = `0x${merkleTree.getRoot().toString('hex')}`;
      ownerMerkleRoot = `0x${ownerMerkleTree.getRoot().toString('hex')}`;
    };

    Adovals = await ethers.getContractFactory('Adovals');
    [
      owner,
      addr1,
      addr2,
      addr3,
      addr4,
      addr5,
      addr6,
      addr7,
      notWhitelistedAddr,
    ] = await ethers.getSigners();

    whitelist = [
      addr1.address,
      addr2.address,
      addr3.address,
      addr4.address,
      addr5.address,
      addr6.address,
      addr7.address,
    ];
    ownerWhitelist = [owner.address, ...whitelist];

    generateMerkleTrees(ownerWhitelist);

    addr1Proof = merkleTree.getHexProof(keccak256(addr1.address));
    addr2Proof = merkleTree.getHexProof(keccak256(addr2.address));
    ownerAddrProof = ownerMerkleTree.getHexProof(keccak256(owner.address));
  });

  beforeEach(async () => {
    hardhatToken = await Adovals.deploy(
      'Adovals',
      'ADV',
      'ipf://base-url.com/',
      'ipf://not-revealed-url.com/hidden.json',
      merkleRoot,
    );
  });

  describe('Deployment', () => {
    it('should set the right owner', async () => {
      expect(await hardhatToken.owner()).to.equal(owner.address);
    });

    it('should set the right name', async () => {
      expect(await hardhatToken.name()).to.equal('Adovals');
    });

    it('should set the right symbol', async () => {
      expect(await hardhatToken.symbol()).to.equal('ADV');
    });

    it('should set the right not revealed URI', async () => {
      expect(await hardhatToken.notRevealedURI()).to.equal(
        'ipf://not-revealed-url.com/hidden.json',
      );
    });

    it('should set the right Merkle root', async () => {
      expect(await hardhatToken.merkleRoot()).to.equal(merkleRoot);
    });
  });

  describe('Initial state', () => {
    it('should set the base URI of the tokens', async () => {
      hardhatToken.enable(true);
      hardhatToken.mint(1, []);
      hardhatToken.reveal(true);

      expect(await hardhatToken.tokenURI(1)).to.equal('ipf://base-url.com/1');
    });

    it('should set the contract as not enabled', async () => {
      expect(await hardhatToken.enabled()).to.equal(false);
    });

    it('should set the contract as in presale', async () => {
      expect(await hardhatToken.inPresale()).to.equal(true);
    });

    it('should set the state of the tokens as not revealed', async () => {
      expect(await hardhatToken.revealed()).to.equal(false);
    });

    it('should set the total presale supply to 0', async () => {
      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
    });

    it('should set the total supply to 0', async () => {
      expect(await hardhatToken.totalSupply()).to.equal(0);
    });

    it('should set the presale max supply to 100', async () => {
      expect(await hardhatToken.presaleMaxSupply()).to.equal(100);
    });

    it('should set the max supply to 1500', async () => {
      expect(await hardhatToken.maxSupply()).to.equal(1500);
    });

    it('should set the presale max mint amount to 2', async () => {
      expect(await hardhatToken.presaleMaxMintAmount()).to.equal(2);
    });

    it('should set the sale max mint amount to 10', async () => {
      expect(await hardhatToken.saleMaxMintAmount()).to.equal(10);
    });

    it('should set the presale cost to 0.03 ether', async () => {
      expect(await hardhatToken.presaleCost()).to.equal(
        ethers.utils.parseEther('0.03'),
      );
    });

    it('should set the cost to 0.04 ether', async () => {
      expect(await hardhatToken.cost()).to.equal(
        ethers.utils.parseEther('0.04'),
      );
    });
  });

  describe('#tokenURI', () => {
    it('should raise an error if the requested token is not minted', async () => {
      await expect(hardhatToken.tokenURI(1)).to.be.revertedWith(
        'URI query for nonexistent token',
      );
    });

    it('should return the not revealed URI if the state of the tokens is not revealed', async () => {
      await hardhatToken.mint(1, []);

      const uri = await hardhatToken.tokenURI(1);

      expect(uri).to.equal('ipf://not-revealed-url.com/hidden.json');
    });

    it('should return the token URI if the state of the tokens is revealed', async () => {
      hardhatToken.reveal(true);
      await hardhatToken.mint(1, []);

      const uri = await hardhatToken.tokenURI(1);

      expect(uri).to.equal('ipf://base-url.com/1');
    });
  });

  describe('#mint', () => {
    beforeEach(async () => {
      tokenNoOwner = hardhatToken.connect(addr1);
    });

    it('should not mint if the contract is not enabled', async () => {
      await expect(
        tokenNoOwner.mint(2, [], { value: ethers.utils.parseEther('0.08') }),
      ).to.be.revertedWith('The contract is not enabled');
    });

    it('should not mint if the amount is not provided', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint()).to.be.reverted;
    });

    it('should not mint if the merkle proof is not provided', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint(2)).to.be.reverted;
    });

    it('should not mint if the amount is 0', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint(0, [])).to.be.revertedWith(
        'A mint amount bigger than 0 needs to be provided',
      );
    });

    describe('address not whitelisted', () => {
      let tokenNotWhitelisted;
      let notWhitelistedProof;

      beforeEach(async () => {
        tokenNotWhitelisted = hardhatToken.connect(notWhitelistedAddr);
        const leaf = keccak256(notWhitelistedAddr.address);
        notWhitelistedProof = merkleTree.getHexProof(leaf);
      });

      it('should not mint if in presale and the address is not whitelisted', async () => {
        hardhatToken.enable(true);
        hardhatToken.presale(true);

        await expect(
          tokenNotWhitelisted.mint(2, notWhitelistedProof, {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).to.be.revertedWith(
          'The used address is not in the presale whitelist',
        );
      });

      it('should mint if not in presale and the address is not whitelisted', async () => {
        hardhatToken.enable(true);
        hardhatToken.presale(false);

        await expect(
          tokenNotWhitelisted.mint(2, notWhitelistedProof, {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });
    });

    it('should mint if in presale and the address is whitelisted', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.08'),
        }),
      ).not.to.be.reverted;
    });

    it('should mint if not in presale and the address is whitelisted', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(2, [], {
          value: ethers.utils.parseEther('0.08'),
        }),
      ).not.to.be.reverted;
    });

    it('should not mint if in presale and empty proof is provided', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(2, [], {
          value: ethers.utils.parseEther('0.08'),
        }),
      ).to.be.revertedWith('The used address is not in the presale whitelist');
    });

    it('should mint if not in presale and empty proof is provided', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(2, [], {
          value: ethers.utils.parseEther('0.08'),
        }),
      ).not.to.be.reverted;
    });

    it('should not mint if the mint amount is bigger than the max permitted in presale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(3, addr1Proof, {
          value: ethers.utils.parseEther('0.12'),
        }),
      ).to.be.revertedWith('The mint amount is bigger than the maximum');
    });

    it('should not mint if the mint amount is bigger than the max permitted in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(11, [], { value: ethers.utils.parseEther('0.44') }),
      ).to.be.revertedWith('The mint amount is bigger than the maximum');
    });

    it('should mint if the mint amount is bigger than presale max and smaller than public sale max if in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(5, [], { value: ethers.utils.parseEther('0.20') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(5);
    });

    it('should not mint if the total mint amount for the account is bigger than the max permitted in presale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.08'),
        }),
      ).not.to.be.reverted;
      await expect(
        tokenNoOwner.mint(1, addr1Proof, {
          value: ethers.utils.parseEther('0.04'),
        }),
      ).to.be.revertedWith(
        'The total mint amount for the account is bigger than the maximum',
      );
    });

    it('should not mint if the total mint amount for the account is bigger than the max permitted in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(10, [], { value: ethers.utils.parseEther('0.40') }),
      ).not.to.be.reverted;
      await expect(
        tokenNoOwner.mint(1, [], { value: ethers.utils.parseEther('0.04') }),
      ).to.be.revertedWith(
        'The total mint amount for the account is bigger than the maximum',
      );
    });

    it('should not mint if there are not enough tokens left', async () => {
      hardhatToken.setMaxSupply(1);
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(2, [], { value: ethers.utils.parseEther('0.08') }),
      ).to.be.revertedWith('There are not enough tokens left');
    });

    it('should not mint if there are not enough presale tokens left', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.08'),
        }),
      ).to.be.revertedWith('There are not enough presale tokens left');
    });

    it('should mint above presale max supply if not in presale', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.setMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(2, [], { value: ethers.utils.parseEther('0.08') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint if total tokens minted is above presale limit but non owner mints is below the limit', async () => {
      hardhatToken.setPresaleMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      hardhatToken.mint(2, []);
      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.06'),
        }),
      ).not.to.be.reverted;
    });

    it('should not mint if total tokens minted is above presale limit and non owner mints is also above the limit', async () => {
      hardhatToken.setPresaleMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      hardhatToken.mint(2, []);
      tokenNoOwner.mint(2, addr1Proof, {
        value: ethers.utils.parseEther('0.06'),
      });
      await expect(
        hardhatToken
          .connect(addr2)
          .mint(2, addr2Proof, { value: ethers.utils.parseEther('0.06') }),
      ).to.be.revertedWith('There are not enough presale tokens left');
    });

    it('should not mint if no ether is sent for the purchase', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint(2, addr1Proof)).to.be.revertedWith(
        'Not enough ether is sent for the purchase',
      );
    });

    it('should not mint if not enough ether is sent for the purchase', async () => {
      hardhatToken.enable(true);

      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.01'),
        }),
      ).to.be.revertedWith('Not enough ether is sent for the purchase');
    });

    it('should mint when ether is provided', async () => {
      hardhatToken.enable(true);

      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.06'),
        }),
      ).not.to.be.reverted;
    });

    it('should count user mints as presale mints', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
      await expect(
        tokenNoOwner.mint(2, addr1Proof, {
          value: ethers.utils.parseEther('0.06'),
        }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalPresaleSupply()).to.equal(2);
    });
  });

  describe('#mint owner', () => {
    it('should mint if the contract is not enabled', async () => {
      await expect(hardhatToken.mint(2, [])).not.to.be.reverted;
    });

    it('should not mint if the amount is not provided', async () => {
      await expect(hardhatToken.mint()).to.be.reverted;
    });

    it('should not mint if the merkle proof is not provided', async () => {
      await expect(hardhatToken.mint(2)).to.be.reverted;
    });

    it('should not mint if the amount is 0', async () => {
      await expect(hardhatToken.mint(0, [])).to.be.revertedWith(
        'A mint amount bigger than 0 needs to be provided',
      );
    });

    describe('owner not whitelisted', () => {
      let leaf;
      let proof;

      before(() => {
        leaf = keccak256(owner.address);
        proof = merkleTree.getHexProof(leaf);
      });

      it('should mint if in presale and the address is not whitelisted', async () => {
        hardhatToken.presale(true);

        expect(proof).to.eql([]);
        await expect(
          hardhatToken.mint(2, proof, {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });

      it('should mint if not in presale and the address is not whitelisted', async () => {
        hardhatToken.presale(false);

        expect(proof).to.eql([]);
        await expect(
          hardhatToken.mint(2, proof, {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });
    });

    describe('owner whitelisted', () => {
      beforeEach(async () => {
        hardhatToken = await Adovals.deploy(
          'Adovals',
          'ADV',
          'ipf://base-url.com/',
          'ipf://not-revealed-url.com/hidden.json',
          ownerMerkleRoot,
        );
      });

      it('should mint if in presale and the address is whitelisted', async () => {
        hardhatToken.presale(true);

        await expect(
          hardhatToken.mint(2, ownerAddrProof, {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });

      it('should mint if not in presale and the address is whitelisted', async () => {
        hardhatToken.presale(false);

        await expect(
          hardhatToken.mint(2, ownerAddrProof, {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });

      it('should mint if in presale and empty proof is provided', async () => {
        hardhatToken.presale(true);

        await expect(
          hardhatToken.mint(2, [], {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });

      it('should mint if not in presale and empty proof is provided', async () => {
        hardhatToken.presale(false);

        await expect(
          hardhatToken.mint(2, [], {
            value: ethers.utils.parseEther('0.08'),
          }),
        ).not.to.be.reverted;
      });
    });

    it('should mint if the mint amount is bigger than the max permitted in presale', async () => {
      hardhatToken.presale(true);

      await expect(hardhatToken.mint(3, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(3);
    });

    it('should mint if the mint amount is bigger than the max permitted in public sale', async () => {
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(11, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(11);
    });

    it('should mint if the mint amount is bigger than presale max and smaller than public sale max if in public sale', async () => {
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(5, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(5);
    });

    it('should mint if the total mint amount for the account is bigger than the max permitted in presale', async () => {
      hardhatToken.presale(true);

      await expect(hardhatToken.mint(2, [])).not.to.be.reverted;
      await expect(hardhatToken.mint(1, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(3);
    });

    it('should mint if the total mint amount for the account is bigger than the max permitted in public sale', async () => {
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(10, [])).not.to.be.reverted;
      await expect(hardhatToken.mint(1, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(11);
    });

    it('should not mint if there are not enough tokens left', async () => {
      hardhatToken.setMaxSupply(1);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(2, [])).to.be.revertedWith(
        'There are not enough tokens left',
      );
    });

    it('should mint if there are not enough presale tokens left', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.presale(true);

      await expect(hardhatToken.mint(2, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint above presale max supply if not in presale', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.setMaxSupply(3);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(2, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint without sending ether', async () => {
      expect(await hardhatToken.totalSupply()).to.equal(0);
      await expect(hardhatToken.mint(2, [])).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should not count mints as presale mints', async () => {
      hardhatToken.presale(true);

      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
      await expect(
        hardhatToken.mint(2, [], { value: ethers.utils.parseEther('0.06') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
    });
  });

  describe('#isValid', async () => {
    it('should return true if the merkle proof is verified', async () => {
      const leaf = keccak256(addr1.address);
      const proof = merkleTree.getHexProof(leaf);

      expect(await hardhatToken.isValid(proof, leaf)).to.equal(true);
    });

    it('should not validate uppercase addresses', async () => {
      const capitalAddress = addr1.address.toUpperCase();
      const leaf = keccak256(capitalAddress);
      const proof = merkleTree.getHexProof(leaf);

      expect(await hardhatToken.isValid(proof, leaf)).to.equal(false);
    });

    it('should validate lowercase addresses', async () => {
      const lowerAddress = addr1.address.toLowerCase();
      const leaf = keccak256(lowerAddress);
      const proof = merkleTree.getHexProof(leaf);

      expect(await hardhatToken.isValid(proof, leaf)).to.equal(true);
    });

    it('should return false if the merkle proof is not verified', async () => {
      const leaf = keccak256('0xAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
      const proof = merkleTree.getHexProof(leaf);

      expect(await hardhatToken.isValid(proof, leaf)).to.equal(false);
    });
  });

  describe('#setBaseURI', () => {
    it('should change the base URI of the tokens', async () => {
      hardhatToken.setBaseURI('http://new-url.com/');

      hardhatToken.mint(1, []);
      hardhatToken.reveal(true);

      expect(await hardhatToken.tokenURI(1)).to.equal('http://new-url.com/1');
    });

    it('should not change the base URI of the tokens if the caller is not the owner', async () => {
      await expect(
        hardhatToken.connect(addr1).setBaseURI('http://new-url.com/'),
      ).to.be.reverted;

      hardhatToken.mint(1, []);
      hardhatToken.reveal(true);

      expect(await hardhatToken.tokenURI(1)).to.equal('ipf://base-url.com/1');
    });
  });

  describe('#setNotRevealedURI', () => {
    it('should change the not revealed URI', async () => {
      hardhatToken.setNotRevealedURI('http://new-not-revealed-url.com/');

      expect(await hardhatToken.notRevealedURI()).to.equal(
        'http://new-not-revealed-url.com/',
      );
    });

    it('should not change the not revealed URI if the caller is not the owner', async () => {
      await expect(
        hardhatToken
          .connect(addr1)
          .setNotRevealedURI('http://new-not-revealed-url.com/'),
      ).to.be.reverted;

      expect(await hardhatToken.notRevealedURI()).to.equal(
        'ipf://not-revealed-url.com/hidden.json',
      );
    });
  });

  describe('#enable', () => {
    it('should toggle the enabled flag', async () => {
      hardhatToken.enable(true);

      expect(await hardhatToken.enabled()).to.equal(true);

      hardhatToken.enable(false);

      expect(await hardhatToken.enabled()).to.equal(false);
    });

    it('should not toggle the enable flag if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).enable(true)).to.be.reverted;
      expect(await hardhatToken.enabled()).to.equal(false);
    });
  });

  describe('#presale', () => {
    it('should toggle the presale flag', async () => {
      hardhatToken.presale(false);

      expect(await hardhatToken.inPresale()).to.equal(false);

      hardhatToken.presale(true);

      expect(await hardhatToken.inPresale()).to.equal(true);
    });

    it('should not toggle the presale flag if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).presale(false)).to.be.reverted;
      expect(await hardhatToken.inPresale()).to.equal(true);
    });
  });

  describe('#reveal', () => {
    it('should toggle the revealed flag', async () => {
      hardhatToken.reveal(true);

      expect(await hardhatToken.revealed()).to.equal(true);

      hardhatToken.reveal(false);

      expect(await hardhatToken.revealed()).to.equal(false);
    });

    it('should not toggle the revealed flag if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).reveal(true)).to.be.reverted;
      expect(await hardhatToken.revealed()).to.equal(false);
    });
  });

  describe('#setPresaleMaxSupply', () => {
    it('should set the presaleMaxSupply value', async () => {
      hardhatToken.setPresaleMaxSupply(110);

      expect(await hardhatToken.presaleMaxSupply()).to.equal(110);
    });

    it('should not set the presaleMaxSupply value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setPresaleMaxSupply(110)).to.be
        .reverted;
      expect(await hardhatToken.presaleMaxSupply()).to.equal(100);
    });
  });

  describe('#setMaxSupply', () => {
    it('should set the maxSupply value', async () => {
      hardhatToken.setMaxSupply(2000);

      expect(await hardhatToken.maxSupply()).to.equal(2000);
    });

    it('should not set the maxSupply value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setMaxSupply(2000)).to.be
        .reverted;
      expect(await hardhatToken.maxSupply()).to.equal(1500);
    });
  });

  describe('#setPresaleMaxMintAmount', () => {
    it('should set the presaleMaxMintAmount value', async () => {
      hardhatToken.setPresaleMaxMintAmount(3);

      expect(await hardhatToken.presaleMaxMintAmount()).to.equal(3);
    });

    it('should not set the presaleMaxMintAmount value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setPresaleMaxMintAmount(3)).to.be
        .reverted;
      expect(await hardhatToken.presaleMaxMintAmount()).to.equal(2);
    });
  });

  describe('#setSaleMaxMintAmount', () => {
    it('should set the saleMaxMintAmount value', async () => {
      hardhatToken.setSaleMaxMintAmount(15);

      expect(await hardhatToken.saleMaxMintAmount()).to.equal(15);
    });

    it('should not set the saleMaxMintAmount value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setSaleMaxMintAmount(15)).to.be
        .reverted;
      expect(await hardhatToken.saleMaxMintAmount()).to.equal(10);
    });
  });

  describe('#setPresaleCost', () => {
    const oldCost = ethers.utils.parseEther('0.03');
    const newCost = ethers.utils.parseEther('0.05');

    it('should set the presaleCost value', async () => {
      hardhatToken.setPresaleCost(newCost);

      expect(await hardhatToken.presaleCost()).to.equal(newCost);
    });

    it('should not set the presaleCost value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setPresaleCost(newCost)).to.be
        .reverted;
      expect(await hardhatToken.presaleCost()).to.equal(oldCost);
    });
  });

  describe('#setCost', () => {
    const oldCost = ethers.utils.parseEther('0.04');
    const newCost = ethers.utils.parseEther('0.05');

    it('should set the cost value', async () => {
      hardhatToken.setCost(newCost);

      expect(await hardhatToken.cost()).to.equal(newCost);
    });

    it('should not set the cost value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setCost(newCost)).to.be.reverted;
      expect(await hardhatToken.cost()).to.equal(oldCost);
    });
  });

  describe('#setMerkleRoot', () => {
    const newMerkleRoot =
      '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa';

    it('should set the Merkle root value', async () => {
      hardhatToken.setMerkleRoot(newMerkleRoot);

      expect(await hardhatToken.merkleRoot()).to.equal(newMerkleRoot);
    });

    it('should not set the Merkle root value if the caller is not the owner', async () => {
      await expect(hardhatToken.connect(addr1).setMerkleRoot(newMerkleRoot)).to
        .be.reverted;
      expect(await hardhatToken.merkleRoot()).to.equal(merkleRoot);
    });
  });

  describe('#withdraw', () => {
    it('should send the contract funds to the caller', async () => {
      hardhatToken.enable(true);

      const balance = BigNumber.from(await owner.getBalance());

      await hardhatToken
        .connect(addr1)
        .mint(2, addr1Proof, { value: ethers.utils.parseEther('0.06') });

      await hardhatToken.withdraw();

      const newBalance = BigNumber.from(await owner.getBalance());
      const gains = BigNumber.from(newBalance.sub(balance));
      const gainsEth = ethers.utils.formatEther(gains);

      expect(gainsEth.substring(0, 5)).to.equal('0.059'); // gains value slightly smaller than the original 0.06 because of gas usage
    });

    it('should not send the contract funds to the caller if the caller is not the owner', async () => {
      hardhatToken.enable(true);

      const balance = BigNumber.from(await owner.getBalance());

      await hardhatToken
        .connect(addr1)
        .mint(2, addr1Proof, { value: ethers.utils.parseEther('0.06') });

      await expect(hardhatToken.connect(addr2).withdraw()).to.be.reverted;

      const newBalance = BigNumber.from(await owner.getBalance());
      const gains = BigNumber.from(newBalance.sub(balance));

      expect(gains.lt(0)).to.equal(true); // gains value below zero because of gas usage
    });
  });
});
