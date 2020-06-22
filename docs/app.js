var budgetController = (function() {
	var Expense= function(id,description,value) {
		this.id=id;
		this.description=description;
		this.value=value;
		this.percentage=-1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {

		if (totalIncome >0) {
			this.percentage=Math.round((this.value/totalIncome)*100);
		}
		else{
			this.percentage=-1;
		}
	};

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	};

	var Income = function(id,description,value) {
		this.id=id;
		this.description=description;
		this.value=value;
	};

	
	calculateTotal= function(type) {
		var sum=0, percentage=-1;

		data.allItems[type].forEach(function(cur) {
			sum=sum + cur.value;
		});
		data.totals[type]=sum;
	}

	var data = {
		allItems: {
			inc:[],
			exp:[]
		},
		totals: {
			exp:0,
			inc:0
		},
		budget:0,
		percentage:-1
	}

	return {
		addItem: function(type,des,val) {
			var newItem;
			//create id
			if (data.allItems[type].length>0) {
				ID = data.allItems[type][data.allItems[type].length-1].id+1;
			} else {
				ID=0;
			}
			
			//create new item based on type inc or exp.
			if(type==='exp'){
				newItem = new Expense(ID,des,val);
			}else if(type==='inc') {
				newItem = new Income(ID,des,val);
			}

			//push it to the data structure.
			data.allItems[type].push(newItem);

			//return the new element.
			return(newItem);
		},

		deleteItem: function(type,id) {
			ids=data.allItems[type].map(function(current){
				return current.id;
			});

			index=ids.indexOf(id);

			if(index!==-1) {
				data.allItems[type].splice(index,1);
			}
		},

		calculateBudget: function() {
			//1.calculate total income and expenses.
			calculateTotal('inc');
			calculateTotal('exp');
			//2. calculate budget= income-exp;
			data.budget=data.totals.inc-data.totals.exp;
			//3. calculate percentage of expense.
			if(data.totals.inc>0) {
				data.percentage=Math.round((data.totals.exp/data.totals.inc)*100);
			}
			else{
				data.percentage=-1;
			}
		},

		calculatePercentages : function() {
			data.allItems.exp.forEach(function(cur) {
				cur.calcPercentage(data.totals.inc);
			});
		},

		getPercentages: function() {
			var allperc=data.allItems.exp.map(function(cur) {
				return cur.getPercentage();
			});

			return allperc;
		},

		getBudget: function() {
			return {
				budget: data.budget,
				totalInc: data.totals.inc,
				totalExp: data.totals.exp,
				percentage: data.percentage
			}
		},
		testing: function() {
			console.log(data);
		}
	}
})();

var UIController = (function() {
	//code
	var DOMstrings= {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer:'.income__list',
		expensesContainer:'.expenses__list',
		budgetLabel:'.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel:'.budget__expenses--percentage',
		container:'.container',
		itemPercentage:'.item__percentage',
		dateLabel:'.budget__title--month'
	};

	formatNumber= function(num,type) {
			num=Math.abs(num);
			num=num.toFixed(2);

			numSplit=num.split('.');
			int=numSplit[0];

			if(int.length >3) {
				int= int.substr(0, int.length - 3)+','+int.substr(int.length-3,3);
			}
			dec=numSplit[1];

			return (type==='exp'?'-':'+')+''+int+'.'+dec;
		};

	return {
		getInput :function () {
			return {
				type: document.querySelector(DOMstrings.inputType).value,
				description: document.querySelector(DOMstrings.inputDescription).value,
				value: parseFloat(document.querySelector(DOMstrings.inputValue).value)

			};
			
		},

		addListItem: function(obj, type) {
			//create html string with placeholder text
			if(type==='inc') {
				element=DOMstrings.incomeContainer;
				html='<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div> </div></div>';
			}
			else if(type==='exp') {
				element=DOMstrings.expensesContainer;
				html='<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}
			//replace placeholder text with actual dada
			newHtml= html.replace('%id%',obj.id);
			newHtml= newHtml.replace('%description%',obj.description);
			newHtml= newHtml.replace('%value%',formatNumber(obj.value, type));
			//insert html dom
			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
		},

		deleteListItem: function(selectorId) {
			el=document.getElementById(selectorId);
			el.parentNode.removeChild(el);
		},

		clearfields:function() {
			var fields,fieldsArr;
			fields=document.querySelectorAll(DOMstrings.inputDescription +','+ DOMstrings.inputValue);

			fieldsArr = Array.prototype.slice.call(fields);

			fieldsArr.forEach(function(current,index,array) {
				current.value='';
			});

			fieldsArr[0].focus();
		},

		 
		displayBudget: function(obj) {
			var type;
		 	obj.budget>0 ? type='inc' : type='exp';

			document.querySelector(DOMstrings.budgetLabel).textContent=formatNumber(obj.budget,type);
			document.querySelector(DOMstrings.incomeLabel).textContent=formatNumber(obj.totalInc,'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent=formatNumber(obj.totalExp,'exp');
			if(obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent=obj.percentage;
			}
			else {
				document.querySelector(DOMstrings.percentageLabel).textContent='---';	
			}
		},

		displayItemPercentage: function(percentages) {
			var fields= document.querySelectorAll(DOMstrings.itemPercentage);

			fields.forEach(function(cur,index){
				if(percentages[index]>0) {
					cur.textContent= percentages[index]+'%';
				} else {
					cur.textContent='---';
				}
			});
		},

		displayMonth:function() {
			var now, year, months, month;

			now= new Date();

			year=now.getFullYear();
			months=['January','february', 'march', 'april', 'may', 'june', 'july', 'august','september', 'october', 'november', 'december'];
			month=now.getMonth();

			document.querySelector(DOMstrings.dateLabel).textContent=months[month]+' ' +year;
		},
		
		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType +','+
				DOMstrings.inputDescription +','+
				DOMstrings.inputValue);
				fields.forEach(function(cur, index){
					cur.classList.toggle('red-focus');
				});

				document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDomStrings: function() {
			return DOMstrings;
			
		}
	};


})();


//GLOBAL APP CONTROLLER
var controller = (function (bgtctrl,uictrl) {
	
	var setUpEventListeners = function() {
		var DOM = uictrl.getDomStrings();
		document.querySelector(DOM.inputBtn).addEventListener('click' , ctrlAdditem);

		document.addEventListener('keypress', function(event) {
			if(event.keyCode===13 || event.which===13) {
				ctrlAdditem();
				}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
		document.querySelector(DOM.inputType).addEventListener('change',uictrl.changedType);
	}

	var updateBudget= function() {
		//1. calculate budget
		bgtctrl.calculateBudget();
		//2. return budget
		var budget = bgtctrl.getBudget();
		//3. update budget on UI
		uictrl.displayBudget(budget);
		//console.log(budget);
	}
	
	var updatePercentages = function() {
		//1. calculate percentages
		bgtctrl.calculatePercentages();
		//2. return percentages
		var percentages=bgtctrl.getPercentages();
		//3. update percentages on ui.
		console.log(percentages);
		uictrl.displayItemPercentage(percentages);

	};

	var ctrlAdditem = function() {
		var inputData, newItem;
		//1. Get i/p field data.
		var inputData = uictrl.getInput();
		
		if(inputData.description !== "" && !isNaN(inputData.value) && inputData.value>0) {
			//2. add the item to budgetcontroller
			newItem=bgtctrl.addItem(inputData.type,inputData.description,inputData.value);
			//3. add the item to  UI controller.
			uictrl.addListItem(newItem,inputData.type);

			//4. clear fields. 
			uictrl.clearfields();

			//5.calculate and update the budget 
			updateBudget();

			//6. calculate percentage for expenses.
			updatePercentages();

		}
		
		//console.log(inputData);
	}

	var ctrlDeleteItem = function(event) {
		itemId = event.target.parentNode.parentNode.parentNode.parentNode.id;
		if(itemId) {
			splitId = itemId.split('-');
			type = splitId[0];
			ID = parseInt(splitId[1]);
			//1. delete the item from data structure.
			bgtctrl.deleteItem(type,ID);
			//2. delete the item from ui.
			uictrl.deleteListItem(itemId);
			//3. update and show the new budget.
			updateBudget();
			updatePercentages();

		}

	}
	return {
		init: function() {
			console.log("application has started.");
			uictrl.displayMonth();
			uictrl.displayBudget({
				budget: 0,
				totalInc: 0,
				totalExp: 0,
				percentage: -1
			});
			setUpEventListeners();
		}
	}
	
})(budgetController,UIController);

controller.init();