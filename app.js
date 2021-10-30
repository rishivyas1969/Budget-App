
//===== UI CONTROLLER ======
var UIController = (function() {

    var DOM = {
        inputType: ".add__type",
        inputDesc: ".add__description",
        inputValue: ".add__value",
        inputBtn: ".add__btn",
        incomeContainer: ".income__list",
        expenseContainer: ".expenses__list",
        budgetLabel: ".budget__value",
        incomeLabel: ".budget__income--value",
        expenseLabel: ".budget__expenses--value",
        percentageLabel: ".budget__expenses--percentage",
        container: ".container",
        expensesPercLabel: ".item__percentage",
        dateLabel: ".budget__title--month"
    }

    var formatNumber= function(num, type) {
        var numSplit, int, dec, sign ;
        num = Math.abs(num) ;
        num = num.toFixed(2) ;

        numSplit = num.split(".") ;
         int = numSplit[0] ;

         if(int.length > 3){
             int = int.substr(0, int.length - 3) + "," + int.substr(int.length - 3, 3) ;
         }

         dec = numSplit[1] ;

         type === "inc" ? sign="+" : sign="-" ;

         return sign + " " + int + "." + dec ;

    }

    var nodeListForEach = function(list, callbackFunc){
        for(var i=0 ; i<list.length ; i++){
            callbackFunc(list[i], i) ;
        }
    }
    return {

        getInput : function() {

            return {
                type : document.querySelector(DOM.inputType).value, // return "inc" or "exp"
                description : document.querySelector(DOM.inputDesc).value,
                value : parseFloat(document.querySelector(DOM.inputValue).value)
            }   
        },
        getDOM: function() {

            return DOM ;
        },
        addListItem: function(obj, type) {
            var html, newHtml, element ;

            // Create html strings.
            if(type === "inc"){
                element = DOM.incomeContainer ;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>' ;
            }
            else if(type == "exp"){
                element = DOM.expenseContainer ;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }
            

            // Replace placeholders with real data.
            newHtml = html.replace("%id%", obj.id) ;
            newHtml = newHtml.replace("%description%", obj.description) ;
            newHtml = newHtml.replace("%value%", formatNumber(obj.value, type)) ;

            // Insert html strings to html code.
            document.querySelector(element).insertAdjacentHTML("beforeend", newHtml) ;
        },
        clearFields: function() {
            var fields ;
            fields = document.querySelectorAll(DOM.inputDesc  + ", " + DOM.inputValue) ;

            fieldsArr = Array.prototype.slice.call(fields) ;

            fieldsArr.forEach(current => {
                current.value = "" ;
            });
        },
        displayBudget: function(obj) {
            var type ;
            obj.budget > 0 ? type="inc" : type="exp" ;

            document.querySelector(DOM.budgetLabel).textContent = formatNumber(obj.budget, type) ;
            document.querySelector(DOM.incomeLabel).textContent = formatNumber(obj.totalInc, "inc") ;
            document.querySelector(DOM.expenseLabel).textContent = formatNumber(obj.totalExp, "exp") ;
            if(obj.percentage > 0){
                document.querySelector(DOM.percentageLabel).textContent = obj.percentage + "%" ;
            }
            else {
                document.querySelector(DOM.percentageLabel).textContent = "---" ;
            }
            
        },
        deleteListItem: function(selectorID){
            var el = document.getElementById(selectorID) ;
            el.parentNode.removeChild(el) ;
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOM.expensesPercLabel) ;

            

            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + "%" ;
                }
                else {
                    current.textContent = "---" ;
                }
                
            }) ;
        },
        displayDate: function(){
            var month, year, date ;
            now = new Date() ;
            months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"] ;
            month = now.getMonth() ;
            year = now.getFullYear() ;
            document.querySelector(DOM.dateLabel).textContent = now.getDay() + " " + months[month] + " " + year ;
        },
        changedType: function() {
            var fields = document.querySelectorAll(
                DOM.inputType + ", " +
                DOM.inputDesc + ", " +
                DOM.inputValue
            ) ;

            nodeListForEach(fields, function(cur) {
                cur.classList.toggle("red-focus") ;
            }) ;

            document.querySelector(DOM.inputBtn).classList.toggle("red") ;
        }

    }

})() ;




//====== BUDGET CONTROLLER =====
var BudgetController = (function() {


    //=== DATA STRUCTURE ====
    var Expenses = function(id, description, value){
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1 ;
    }

    Expenses.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0) {
            this.percentage = Math.round((this.value/totalIncome) * 100) ;
        }
        else {
            this.percentage = -1 ;
        }
    }

    Expenses.prototype.getPercentage = function(){
        return this.percentage ;
    }


    var Income = function(id, description, value){
        this.id = id,
        this.description = description,
        this.value = value
    }

    var calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(cur){
            sum += cur.value ;
        }) ;
        data.totals[type] = sum ;
    }

    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            inc: 0,
            exp: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function(type, des, val){
            var newItem ;

            // Create new ID.
            if( data.allItems[type].length > 0 ){
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1 ;
            }
            else{
                ID = 0 ;                
            }

            // Create new Item.
            if(type === "exp"){
                newItem = new Expenses(ID, des, val) ;
            } else if(type === "inc"){
                newItem = new Income(ID, des, val) ;
            }

            // Add item in "data : allItems" structure.
            data.allItems[type].push(newItem) ;

            // return newly created item to main Controller to display it on  UI.
            return newItem ;
        },
        calculateBudget: function() {

            // Calculate the income and expenses total.
            calculateTotal("inc") ;
            calculateTotal("exp") ;

            // calculate budget: nicome - expenses
            data.budget = data.totals.inc - data.totals.exp ;

            // calculate percentage of of income spent.
            if(data.totals.inc > 0){
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100) ;
            }
            else {
                data.percentage = -1 ;
            }
            

        }, 
        getBudget: function() {
            return {
                budget: data.budget,
                percentage: data.percentage,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp
            }
        },
        calculatePercentages: function() {
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc) ;
            }) ;
        },

        getPercentages: function() {
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage() ;
            }) ;
            return allPerc ;
        },

        deleteItem: function(type, id){
            var ids ;

            ids = data.allItems[type].map(function(current){
                return current.id ;
            }) ;

            index = ids.indexOf(id) ;

            if(index !== -1){
                data.allItems[type].splice(index, 1) ;
            }

        },

        testing: function(){
            console.log(data) ;
        }
    }

})() ;

// ====== CONTROLLER ========
var Controller = (function(UICtrl, BudgetCtrl){

    //=== EVENT LISTENER FUNCTION ===
    var setupEventListners = function() {

        var DOM = UICtrl.getDOM() ;

        document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem) ;
        document.addEventListener("keypress", function(event) {
            if(event.which === 13 || event.keyCode === 13){
                ctrlAddItem() ;
            }
        }) ;

        document.querySelector(DOM.container).addEventListener("click", ctrlDeleteItem) ;
        document.querySelector(DOM.inputType).addEventListener("change", UICtrl.changedType) ;
    }


    // MANIPULATE THE BUDGET
    var updateBudget = function() {

        // 4. Calculate the budget.
        BudgetCtrl.calculateBudget() ;

        // 5. Return the budget.
        budget = BudgetCtrl.getBudget() ;

        // 5. Display budget.
        UICtrl.displayBudget(budget) ;
    }

    // DELETING THE ITEM
    var ctrlDeleteItem = function(event){
        var itemID, splitID, ID, type ;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id ;
        if(itemID){
            splitID = itemID.split("-") ;
            type = splitID[0] ;
            ID = parseInt(splitID[1]) ;

            // 1. Delete the item from data structure.
            BudgetCtrl.deleteItem(type, ID) ;

            // 2. Delete the item from UI.
            UICtrl.deleteListItem(itemID) ;

            // 3. Update and display the budget.
            updateBudget() ;

            // 4. Update Percentages.
            updatePercentages() ;
        }
    }

    // CALCULATING THE PERCENTAGES
    var updatePercentages = function() {

        // 1. Calculate the percantages.
        BudgetCtrl.calculatePercentages() ;

        // 2. Get percentages.
        var percentages = BudgetCtrl.getPercentages() ;

        // 3. Update the UI.
        UICtrl.displayPercentages(percentages) ;
    }

    // CONRTROLLING THE ITEMS
    var ctrlAddItem = function() {
        var Input, newItem ;
        // 1. Get input data.
        Input = UICtrl.getInput() ;


        if(Input.description !== "" && !isNaN(Input.value) && Input.value > 0){
            // 2. Store the data in data structure.
            newItem = BudgetCtrl.addItem(Input.type, Input.description, Input.value) ;

            // 3. Put it on UI.
            UICtrl.addListItem(newItem, Input.type) ;

            // 3.2 Clear the input fields.
            UICtrl.clearFields() ;

            // 4. Calculate and update Budget.
            updateBudget() ;

            // 5. Update Percentages.
            updatePercentages() ;
        }
        
    }


    

    return {

        //=== INITIALIZING APP ===
        init: function(){
            console.log("App Started!") ;
            UICtrl.displayBudget({
                budget: 0,
                percentage: -1,
                totalInc: 0,
                totalExp: 0
            }) ;
            UICtrl.displayDate() ;
            setupEventListners() ;
        }

    }

})(UIController, BudgetController) ;

//=== LAUNCH THE APP ===
Controller.init() ;
