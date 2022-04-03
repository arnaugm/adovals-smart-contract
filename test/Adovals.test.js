const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('Adovals contract', () => {
  let Adovals;
  let hardhatToken;
  let owner;
  let addr1;

  beforeEach(async () => {
    // Get the ContractFactory and Signers here.
    Adovals = await ethers.getContractFactory('Adovals');
    [owner, addr1] = await ethers.getSigners();

    // To deploy our contract, we just have to call deploy() and await
    // for it to be deployed(), which happens once its transaction has been
    // mined.
    hardhatToken = await Adovals.deploy('Adovals', 'ADV');
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
  });

  describe('Initial state', () => {
    it('should set the contract as not enabled', async () => {
      expect(await hardhatToken.enabled()).to.equal(false);
    });

    it('should set the contract as in presale', async () => {
      expect(await hardhatToken.inPresale()).to.equal(true);
    });

    it('should set the total supply to 0', async () => {
      expect(await hardhatToken.totalSupply()).to.equal(0);
    });

    it('should set the presale max mint amount to 2', async () => {
      expect(await hardhatToken.presaleMaxMintAmount()).to.equal(2);
    });
  });

  describe('#mint', () => {
    it('should not mint if the contract is not enabled', async () => {
      await expect(hardhatToken.mint(2)).to.be.revertedWith(
        'The contract is not enabled',
      );
    });

    it('should not mint if the amount is not provided', async () => {
      hardhatToken.enable(true);
      await expect(hardhatToken.mint()).to.be.reverted;
    });

    it('should not mint if the amount is 0', async () => {
      hardhatToken.enable(true);
      await expect(hardhatToken.mint(0)).to.be.revertedWith(
        'A mint amount bigger than 0 needs to be provided',
      );
    });

    it('should not mint if the mint amount is bigger than the max permitted', async () => {
      hardhatToken.enable(true);
      await expect(hardhatToken.mint(3)).to.be.revertedWith(
        'The mint amount is bigger than the maximum',
      );
    });

    it('should not mint if there are not enough tokens left', async () => {
      hardhatToken.setMaxSupply(1);
      hardhatToken.enable(true);
      await expect(hardhatToken.mint(2)).to.be.revertedWith(
        'There are not enough tokens left',
      );
    });

    it('should not mint if no  ether is sent for the purchase', async () => {
      hardhatToken.enable(true);
      await expect(hardhatToken.connect(addr1).mint(2)).to.be.revertedWith(
        'Not enough ether is sent for the purchase',
      );
    });

    it('should not mint if not enough ether is sent for the purchase', async () => {
      hardhatToken.enable(true);
      await expect(
        hardhatToken
          .connect(addr1)
          .mint(2, { value: ethers.utils.parseEther('0.01') }),
      ).to.be.revertedWith('Not enough ether is sent for the purchase');
    });

    it('should mint without sending ether if the sender is the owner', async () => {
      hardhatToken.enable(true);
      expect(await hardhatToken.totalSupply()).to.equal(0);
      await expect(hardhatToken.mint(2)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint if the sender is not the owner when ether is provided', async () => {
      hardhatToken.enable(true);
      await expect(
        hardhatToken
          .connect(addr1)
          .mint(2, { value: ethers.utils.parseEther('0.06') }),
      ).not.to.be.reverted;
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
});
