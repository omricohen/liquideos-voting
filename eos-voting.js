var eosVoter = class {
    constructor() {
        this.network = {
    	    blockchain:'eos',
    	    host:'13.71.191.137', 
    	    port:8889, 
    	    chainId:null, 
        }
        this.eos = null;
        document.getElementById("cleos_name").onkeyup = this.updateAccountName;
    }
    
    addTd(text) {
        var td = document.createElement('td');		
	    td.innerHTML = text;
	    return td;    
    }
    
    vote(errorHandler, successHandler) {
      console.log(this.network);
    	return scatter.suggestNetwork(this.network).then( (selectedNetwork) => {
    		console.log("selectedNetwork", selectedNetwork);
    
    		return scatter.getIdentity().then(identity => {
    			console.log("identity",identity);
            this.eos.transaction(tr => {
              tr.voteproducer(identity.name,"",this.getSelectedBPs());
            });
    		    //return this.eos.contract('eosio').then(contract => {
    		    	// console.log("contract",contract);		    
    		    	// return contract.newaccount(identity.name,"test1",identity.name,null,null,null)
    		    	// return contract.delegatebw(identity.name,identity.name,net,cpu,"0.0 EOS").then(result=>{
    		    		//return contract.voteproducer(identity.name,"",this.getSelectedBPs());
    		    	// });
    			    // 
    			//});
    		});
    	}).then(res=>{
    		this.voteSuccess(res);

    	}).catch(error => {		
    		this.voteError(error);
    	});		
    }

    getSelectedBPs() {
      var selected = [];
      document.getElementsByName("bpVote").forEach(function(bp) {
        if (bp.checked)
          selected.push(bp.value);
      });
      return selected;
    }

    updateAccountName() {
      document.getElementById("cleos_account").innerHTML = document.getElementById("cleos_name").value;
    }

    bpClick() {
      var bps = voter.getSelectedBPs();
      document.getElementById("cleos_bps").innerHTML = bps.join(" ");
    }

    voteSuccess(res) {
      //otodo
      console.log(res);
      var msg = '<div class="alert alert-success">' + res.message + '</div>';
      document.getElementById("messages").innerHTML = msg;
    }

    voteError(res) {
      //otodo
      console.log(res);
      var msg = '<div class="alert alert-danger">' + res.message + '</div>';
      document.getElementById("messages").innerHTML = msg;
    }

    populateBPs(){
        // populate producer table
        return this.eos.getTableRows({
            "json": true,
            "scope": 'eosio',
            "code": 'eosio',
            "table": "producers",
            "limit": 500
        });     
    }

    refreshBPs() {
      var eosOptions = {};
      var table;

      this.verifyScatter();
      this.eos = this.scatter.eos( this.network, Eos.Localnet, eosOptions );
      this.populateBPs().then(res=>{ 
        this.buildTable(res);
       });
      
    }

    verifyScatter() {
      this.scatter = window.scatter;
      this.scatter.requireVersion(3.0);
    }

    buildTable(res) {
      var table = document.getElementsByTagName('tbody')[0];

      this.countTotalVotes(res);
      
      var sorted = res.rows.sort((a,b) => Number(a.total_votes) > Number(b.total_votes) ? -1:1);
      
      for (var i = 0; i <sorted.length; i++) {
        var row = sorted[i];
        var tr = document.createElement('tr');
        table.append(tr);
        tr.append(this.addTd('<input name="bpVote" type="checkbox" value="'+row.owner+'">'));
        tr.append(this.addTd("<a href='"+row.url+"'>"+row.owner+"</a>"));
        tr.append(this.addTd(row.location));     
        tr.append(this.addTd(this.cleanNumber(row.total_votes)));
        tr.append(this.addTd(this.createProgressBar(this.cleanPercent(this.voteNumber(row.total_votes)/this.votes))));
      }
      document.getElementsByName("bpVote").forEach(e => {
            e.onclick = this.bpClick;
        });
      return table;
    }

    countTotalVotes(res) {
      this.votes = 0;
      for (var i = res.rows.length-1;i >= 0; i--) {
        this.votes += this.voteNumber(res.rows[i].total_votes);
      }
    }

    search() {
      var input, filter, table, tr, td, i;
      input = document.getElementById("search");
      filter = input.value.toUpperCase();
      table = document.getElementById("bps");
      tr = table.getElementsByTagName("tr");

      // Loop through all table rows, and hide those who don't match the search query
      for (i = 1; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[1];
        if (td) {
          if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
            tr[i].style.display = "";
          } else {
            tr[i].style.display = "none";
          }
        } 
      }
    }

    voteNumber(total_votes) {
      return parseInt(parseInt(total_votes) / 1e10 * 1.4);  
    } 
    cleanNumber(num) {
      num = this.voteNumber(num);
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
    createProgressBar(pct) {
      return '<div class="progress-bar active float-left" role="progressbar" style="width:'+pct+'">&nbsp;</div>'+
             '<span class="text-dark current-value">'+pct+'</span>';
    }
    cleanPercent(num) {
      return Math.round(num*10000) / 100 + "%";
    }

    timeDifference(previous) {
      var msPerMinute = 60 * 1000;
      var msPerHour = msPerMinute * 60;
      var msPerDay = msPerHour * 24;
      var msPerMonth = msPerDay * 30;
      var msPerYear = msPerDay * 365;

      var elapsed = (new Date().getTime()) - previous;

      if (elapsed < msPerMinute) {
           return Math.round(elapsed/1000) + ' seconds ago';   
      }

      else if (elapsed < msPerHour) {
           return Math.round(elapsed/msPerMinute) + ' minutes ago';   
      }

      else if (elapsed < msPerDay ) {
           return Math.round(elapsed/msPerHour ) + ' hours ago';   
      }

      else if (elapsed < msPerMonth) {
          return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
      }

      else if (elapsed < msPerYear) {
          return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
      }

      else {
          return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
      }
  } 

}


var voter = new eosVoter();
document.getElementById("vote_button").addEventListener('click', function() {
  voter.vote()
});
document.addEventListener('scatterLoaded', scatterExtension => {
  voter.refreshBPs();
});
