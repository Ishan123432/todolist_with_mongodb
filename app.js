const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const _ = require("lodash");
const app = express();
 
main().catch(err => console.log(err))
 
async function main(){
 
app.set('view engine', 'ejs');
 
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
 
mongoose.connect("mongodb+srv://ishansgupta15:simple123@cluster0.mdrsdiy.mongodb.net/todolistDB");
 
const itemSchema = ({
  name: String
})
 
const Item = mongoose.model('Item',itemSchema)
 
const item1 = new Item({
  name: "Welcome to your todolist!"
})
 
const item2 = new Item({
  name: "Hit the + button to add a new item"
})
 
const item3 = new Item({
  name: "<--Hit this to delete an item."
})
 
const defaultItems = [item1,item2,item3]
const listSchema= {
  name:String,
  items: [itemSchema]
};
 const List = mongoose.model("List",listSchema);
app.get("/", async function(req, res) {
 
  var foundItems = await Item.find()
 
  if(foundItems.length === 0){
  Item.insertMany(defaultItems)
  .then(function () {
    console.log("Successfully saved default items to DB")
  })
  .catch(function (err) {
    console.log(err)
  })
  res.redirect("/")
  }else{
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
 
  List.findOne({name:customListName})
    .then(function(foundList){
        
          if(!foundList){
            const list = new List({
              name:customListName,
              items:defaultItems
            });
          
            list.save();
            console.log("saved");
            res.redirect("/"+customListName);
          }
          else{
            res.render("list",{listTitle:foundList.name, newListItems:foundList.items});
          }
    })
    .catch(function(err){});
 
 
  
  
})
app.post("/", async (req, res) => {
  let itemName = req.body.newItem
  let listName = req.body.list

  const item = new Item({
      name: itemName,
  })

  if (listName === "Today") {
      item.save()
      res.redirect("/")
  } else {

      await List.findOne({ name: listName }).exec().then(foundList => {
          foundList.items.push(item)
          foundList.save()
          res.redirect("/" + listName)
      }).catch(err => {
          console.log(err);
      });
  }
})
app.post("/delete", function(req, res){
 
  const checkedItemId = req.body.checkbox.trim();
  const listName = req.body.listName;
  if(listName === "Today"){
    Item.findByIdAndRemove(checkedItemId).then(function(foundItem){Item.deleteOne({_id: checkedItemId})})
   
    res.redirect("/");
  }
  else

  {

    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id: checkedItemId}}}).then(function(foundlist){ //here  findoneandupdate(condition,update,callback)

      res.redirect("/"+ listName);

    });

  }
 
});
 
app.get("/about", function(req, res){
  res.render("about");
});
 
app.listen(3000, function() {
  console.log("Server started on port 3000");
});
 
}