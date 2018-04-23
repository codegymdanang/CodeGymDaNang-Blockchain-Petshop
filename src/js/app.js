App = {
  web3Provider: null,
  contracts: {},

  init: function() {
    // Load pets.
    $.getJSON('../pets.json', function(data) {
      var petsRow = $('#petsRow');
      var petTemplate = $('#petTemplate');

      for (i = 0; i < data.length; i ++) {
        petTemplate.find('.panel-title').text(data[i].name);
        petTemplate.find('img').attr('src', data[i].picture);
        petTemplate.find('.pet-breed').text(data[i].breed);
        petTemplate.find('.pet-age').text(data[i].age);
        petTemplate.find('.pet-location').text(data[i].location);
        petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

        petsRow.append(petTemplate.html());
      }
    });

    return App.initWeb3();
  },

  initWeb3: function() {
    // is there an injected web3 instance?
    if (typeof window.web3 !== 'undefined') {
      App.web3Provider = window.web3.currentProvider;
    } else {
      // if no injected web3 instance detected, fallback to the TestRPC.
      // not suitable for production
      console.log('using TestRPC');
      App.web3Provider = new window.Web3.providers.HttpProvider("http://localhost:8545");
    }
    web3 = new window.Web3(App.web3Provider);

    return App.initContract();
  },

  initContract: function() {

    $.getJSON("Adoption.json", function(data) {
      // get the necessary contract artifact file and instantiate it with truffle-contract
      var AdoptionArtifact = data;
      App.contracts.Adoption = TruffleContract(AdoptionArtifact)

      // Set the provider for our contract
      App.contracts.Adoption.setProvider(App.web3Provider);

      // use our contract to retrieve and mark the adopted pets
      return App.markAdopted()
    });

    return App.bindEvents();
  },

  bindEvents: function() {
    $(document).on('click', '.btn-adopt', App.handleAdopt);
  },

  markAdopted: function(adopters, account) {
    var adoptionInstance;

    App.contracts.Adoption.deployed().then(function(instance) {
      adoptionInstance = instance;

      return adoptionInstance.getAdopters.call();
    }).then(function(adopters) {
      for (i = 0; i < adopters.length; i++) {
        if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
          $('.panel-pet').eq(i).find('button').text('Success').attr('disabled', true);
        }
      }
    }).catch(function(err) {
      console.log(err.message);
    });
  },

  handleAdopt: function(event) {
    event.preventDefault();

    var petId = parseInt($(event.target).data('id'));

    event.target.innerText = "Loading...";
    var adoptionInstance;

    web3.eth.getAccounts(function(error, accounts) {
      if (error) {
        console.log(error);
        //0x5AF033243D526FF5cdeBBA77EabfF1f17D9a294A
      }

      var account = accounts[0];

      App.contracts.Adoption.deployed().then(function(instance) {
        adoptionInstance = instance;

        // Execute adopt as a transaction by sending account
        return adoptionInstance.adopt(petId, {from: account});
      }).then(function(result) {
        setTimeout(function(){
          App.markSingleAdopted(petId);
        }, 4000)
        // return App.markAdopted();
      }).catch(function(err) {
        console.log(err.message);
      });
    });

  }

//0x5AF033243D526FF5cdeBBA77EabfF1f17D9a294A
//0x5af033243d526ff5cdebba77eabff1f17d9a294a



};

$(function() {
  $(window).load(function() {
    App.init();

  });
});
