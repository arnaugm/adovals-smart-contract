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
    hardhatToken = await Adovals.deploy();
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
});
