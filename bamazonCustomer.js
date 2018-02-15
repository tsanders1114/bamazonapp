var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require('cli-table');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  // Your username
  user: "root",

  // Your password
  password: "",
  database: "bamazon_db"
});

connection.connect(function(err) {
  if (err) throw err;
 console.log("Connection successful");
 displayTable();
});

var displayTable = function(){
    var table = new Table({
        head: ['Item Id', 'Product Name','Department Name','Price','Stock Quantity' ]
      , colWidths: [10,25,25,25,25]
    });
     
    
    connection.query("Select * From products", function(err,res){
        for(var i =0;i<res.length;i++){
            var productDetails=[res[i].itemid,res[i].productname,res[i].departmentname,res[i].price,res[i].stockquantity]
            // table is an Array, so you can `push`, `unshift`, `splice` and friends 
        table.push(productDetails);
        //console.log(res[i].itemid +" "+res[i].productname+" || "+ res[i].departmentname+" || "+res[i].price+" || "+res[i].stockquantity+"\n");
        }
        console.log(table.toString());
        clientPrompt(res);
    });
};

function clientPrompt(res) {
    inquirer
      .prompt({
        name: "choice",
        type: "input",
        message: "What would you like to purchase today in our store? (Note: Please type your selection!)"
      })
      .then(function(answer) {
        var correct = false;
        for(var i=0; i<res.length;i++){
          if(res[i].itemid==answer.choice){
              correct=true;
              var product=answer.choice;
              var id=i;
              inquirer.prompt({
                  type:"input",
                  name:"quant",
                  message:"How many would you like to purchase?",
                  validate:function(value){
                      if(isNaN(value)==false){
                          return true;
                      }else{
                          return false;
                      }
                  }
                }).then(function(answer){
                  if((res[id].stockquantity-answer.quant)>0){
                      connection.query("UPDATE products SET stockquantity='"+(res[id].stockquantity-answer.quant)+"' WHERE productname='"+product+"'", function(err,res2){
                          console.log("Product Purchased!");
                          inquirer.prompt({
                            type:"input",
                            name:"continue",
                            message:"Would you like to purchase something else? (Y / N)" 
                          })
                          .then(function(answer){
                              if(answer.continue.toLowerCase()===('y')){
                                 displayTable();   
                              }else{
                                  console.log("Thanks Have A Great Day");
                              }

                          }) 
                      })
                    }else{
                        console.log("Not a valid selection!");
                        clientPrompt(res);
                    }  
              })

            }
        }
    });
  }

