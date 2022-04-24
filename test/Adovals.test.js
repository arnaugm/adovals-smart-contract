const { expect } = require('chai');
const { ethers } = require('hardhat');
const { BigNumber } = require('ethers');

describe('Adovals contract', () => {
  let Adovals;
  let hardhatToken;
  let tokenNoOwner;
  let owner;
  let addr1;
  let addr2;

  beforeEach(async () => {
    Adovals = await ethers.getContractFactory('Adovals');
    [owner, addr1, addr2] = await ethers.getSigners();

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

  describe('#mint', () => {
    beforeEach(async () => {
      tokenNoOwner = hardhatToken.connect(addr1);
    });

    it('should not mint if the contract is not enabled', async () => {
      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.08') }),
      ).to.be.revertedWith('The contract is not enabled');
    });

    it('should not mint if the amount is not provided', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint()).to.be.reverted;
    });

    it('should not mint if the amount is 0', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint(0)).to.be.revertedWith(
        'A mint amount bigger than 0 needs to be provided',
      );
    });

    it('should not mint if the mint amount is bigger than the max permitted in presale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(3, { value: ethers.utils.parseEther('0.12') }),
      ).to.be.revertedWith('The mint amount is bigger than the maximum');
    });

    it('should not mint if the mint amount is bigger than the max permitted in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(11, { value: ethers.utils.parseEther('0.44') }),
      ).to.be.revertedWith('The mint amount is bigger than the maximum');
    });

    it('should mint if the mint amount is bigger than presale max and smaller than public sale max if in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(5, { value: ethers.utils.parseEther('0.20') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(5);
    });

    it('should not mint if the total mint amount for the account is bigger than the max permitted in presale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.08') }),
      ).not.to.be.reverted;
      await expect(
        tokenNoOwner.mint(1, { value: ethers.utils.parseEther('0.04') }),
      ).to.be.revertedWith(
        'The total mint amount for the account is bigger than the maximum',
      );
    });

    it('should not mint if the total mint amount for the account is bigger than the max permitted in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(10, { value: ethers.utils.parseEther('0.40') }),
      ).not.to.be.reverted;
      await expect(
        tokenNoOwner.mint(1, { value: ethers.utils.parseEther('0.04') }),
      ).to.be.revertedWith(
        'The total mint amount for the account is bigger than the maximum',
      );
    });

    it('should not mint if there are not enough tokens left', async () => {
      hardhatToken.setMaxSupply(1);
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.08') }),
      ).to.be.revertedWith('There are not enough tokens left');
    });

    it('should not mint if there are not enough presale tokens left', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.08') }),
      ).to.be.revertedWith('There are not enough presale tokens left');
    });

    it('should mint above presale max supply if not in presale', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.setMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.08') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint if total tokens minted is above presale limit but non owner mints is below the limit', async () => {
      hardhatToken.setPresaleMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      hardhatToken.mint(2);
      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.06') }),
      ).not.to.be.reverted;
    });

    it('should not mint if total tokens minted is above presale limit and non owner mints is also above the limit', async () => {
      hardhatToken.setPresaleMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      hardhatToken.mint(2);
      tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.06') });
      await expect(
        hardhatToken
          .connect(addr2)
          .mint(2, { value: ethers.utils.parseEther('0.06') }),
      ).to.be.revertedWith('There are not enough presale tokens left');
    });

    it('should not mint if no ether is sent for the purchase', async () => {
      hardhatToken.enable(true);

      await expect(tokenNoOwner.mint(2)).to.be.revertedWith(
        'Not enough ether is sent for the purchase',
      );
    });

    it('should not mint if not enough ether is sent for the purchase', async () => {
      hardhatToken.enable(true);

      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.01') }),
      ).to.be.revertedWith('Not enough ether is sent for the purchase');
    });

    it('should mint when ether is provided', async () => {
      hardhatToken.enable(true);

      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.06') }),
      ).not.to.be.reverted;
    });

    it('should count user mints as presale mints', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
      await expect(
        tokenNoOwner.mint(2, { value: ethers.utils.parseEther('0.06') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalPresaleSupply()).to.equal(2);
    });
  });

  describe('#mint owner', () => {
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

    it('should mint if the mint amount is bigger than the max permitted in presale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(hardhatToken.mint(3)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(3);
    });

    it('should not mint if the mint amount is bigger than the max permitted in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(11)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(11);
    });

    it('should mint if the mint amount is bigger than presale max and smaller than public sale max if in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(5)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(5);
    });

    it('should mint if the total mint amount for the account is bigger than the max permitted in presale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(hardhatToken.mint(2)).not.to.be.reverted;
      await expect(hardhatToken.mint(1)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(3);
    });

    it('should mint if the total mint amount for the account is bigger than the max permitted in public sale', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(10)).not.to.be.reverted;
      await expect(hardhatToken.mint(1)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(11);
    });

    it('should not mint if there are not enough tokens left', async () => {
      hardhatToken.setMaxSupply(1);
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(2)).to.be.revertedWith(
        'There are not enough tokens left',
      );
    });

    it('should mint if there are not enough presale tokens left', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      await expect(hardhatToken.mint(2)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint above presale max supply if not in presale', async () => {
      hardhatToken.setPresaleMaxSupply(1);
      hardhatToken.setMaxSupply(3);
      hardhatToken.enable(true);
      hardhatToken.presale(false);

      await expect(hardhatToken.mint(2)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should mint without sending ether', async () => {
      hardhatToken.enable(true);

      expect(await hardhatToken.totalSupply()).to.equal(0);
      await expect(hardhatToken.mint(2)).not.to.be.reverted;
      expect(await hardhatToken.totalSupply()).to.equal(2);
    });

    it('should not count mints as presale mints', async () => {
      hardhatToken.enable(true);
      hardhatToken.presale(true);

      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
      await expect(
        hardhatToken.mint(2, { value: ethers.utils.parseEther('0.06') }),
      ).not.to.be.reverted;
      expect(await hardhatToken.totalPresaleSupply()).to.equal(0);
    });
  });

  describe('#withdraw', () => {
    it('should send the contract funds to the caller', async () => {
      hardhatToken.enable(true);

      const balance = BigNumber.from(await owner.getBalance());

      await hardhatToken
        .connect(addr1)
        .mint(2, { value: ethers.utils.parseEther('0.06') });

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
        .mint(2, { value: ethers.utils.parseEther('0.06') });

      await expect(hardhatToken.connect(addr2).withdraw()).to.be.reverted;

      const newBalance = BigNumber.from(await owner.getBalance());
      const gains = BigNumber.from(newBalance.sub(balance));

      expect(gains.lt(0)).to.equal(true); // gains value below zero because of gas usage
    });
  });
});
