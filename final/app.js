// BUDGET CONTROLLER
let budgetController = (function () {

    let Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.precentage = -1;
    };

    Expense.prototype.calcPrecentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.precentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.precentage = -1;
        }
    };

    Expense.prototype.getPrecentage = function () {
        return this.precentage;
    }

    let Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    let calculateTotals = function (type) {
        let sum = 0;

        data.allItems[type].forEach(cur => {
            sum += cur.value;
        });

        data.totals[type] = sum;
    };

    let data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        precentage: -1
    };


    return {
        addItem: function (type, des, val) {
            let newItem, ID;

            //[1 2 3 4 5], next ID = 6
            //[1 2 4 6 8], next ID = 9
            // ID = last ID + 1

            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1
            } else {
                ID = 0;
            }

            // Create new item based on 'inc' or 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            // Push it into our data structure
            data.allItems[type].push(newItem);

            // Return the new element
            return newItem;
        },

        deleteItem: function (type, id) {
            let ids, index;

            ids = data.allItems[type].map(function (cur) {
                return cur.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

            // data.allItems[type].splice(id, 1);

        },

        calculateBudget: function () {

            // Calculate total income and expenese
            calculateTotals('exp');
            calculateTotals('inc');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the precentage of income that we spent
            if (data.totals.inc > 0) {
                data.precentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.precentage = -1;
            };
        },

        calculatePrecentage: function () {
            data.allItems.exp.forEach(function (cur) {
                return cur.calcPrecentage(data.totals.inc);
            });
        },

        getPrecentage: function () {
            let allPrec = data.allItems.exp.map(function (cur) {
                return cur.getPrecentage();
            });
            return allPrec;
        },

        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                precentage: data.precentage
            }
        },

        testing: function () {
            console.log(data);
        }
    };

})();
budgetController.testing();








// UI CONTROLLER
let UIController = (function () {

    let DOMstrings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expeneseLabel: '.budget__expenses--value',
        precentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expenesesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month',
    };

    var formatNumber = function (num, type) {
        var numSplit, int, dec, type;

        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
        }

        dec = numSplit[1];

        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

    };

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMstrings.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },

        addListItem: function (obj, type) {
            let html, newHtml, element;

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div ></div ></div > '
            } else if (type === 'exp') {
                element = DOMstrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            // Replace the placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            // insert the html into the Dom
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (selectorID) {
            let items = document.getElementById(selectorID);

            items.parentNode.removeChild(items);
        },

        clearFields: function () {
            let fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(ele => {
                ele.value = '';
            });

            fieldsArr[0].focus();

        },

        displayBudget: function (obj) {
            let type;

            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expeneseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.precentage > 0) {
                document.querySelector(DOMstrings.precentageLabel).textContent = obj.precentage + '%';
            } else {
                document.querySelector(DOMstrings.precentageLabel).textContent = '___';
            };
        },

        displayPrecentage: function (precentages) {

            let fields = document.querySelectorAll(DOMstrings.expenesesPercLabel);

            /* let nodeListForEach = function (list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i], i);
                };
            };

            nodeListForEach(fields, function (current, index) {
                if (precentages[index] > 0) {
                    current.textContent = precentages[index] + '%';
                } else {
                    current.textContent = '___';
                };
            }); */

            let fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (cur, index) {
                if (precentages[index] > 0) {
                    cur.textContent = precentages[index] + '%';
                } else {
                    cur.textContent = '___';
                };
            });
        },

        displayMonth: function () {
            let now, months, month, year;

            now = new Date()

            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
            month = now.getMonth()
            year = now.getFullYear();

            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;

        },

        changedType: function () {

            let fields = document.querySelectorAll(DOMstrings.inputType + ',' + DOMstrings.inputDescription + ',' + DOMstrings.inputValue)

            let nodeListForEach = function (list, callback) {
                for (let i = 0; i < list.length; i++) {
                    callback(list[i]);
                };
            };

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        getDOMstrings: function () {
            return DOMstrings;
        }
    };

})();









// GLOBAL APP CONTROLLER
let controller = (function (budgetCtrl, UICtrl) {

    let setupEventListeners = function () {
        let DOM = UICtrl.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };

    let updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. return the budget
        let budget = budgetCtrl.getBudget();

        // 3. display the budget on the ui
        UICtrl.displayBudget(budget);
    };

    let updatePrecentage = function () {

        // 1- calculate precentages
        budgetCtrl.calculatePrecentage();

        // 2- read precentages from the budget controller
        let precentages = budgetCtrl.getPrecentage();

        // 3- update the UI with the new precentages
        UICtrl.displayPrecentage(precentages);
    };

    let ctrlAddItem = function () {
        let input, newItem;

        // 1. Get the field input data
        input = UICtrl.getInput();

        if (input.description !== '' && !isNaN(input.value) && input.value > 0) {
            // 2. Add the item to the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the item to the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields()

            // 5- calculate and update budget
            updateBudget();

            // 6- calculate and update percentages
            updatePrecentage()
        }
    };

    let ctrDeleteItem = function (event) {
        let itemID, splitID, type, id;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {

            splitID = itemID.split('-');

            type = splitID[0];

            id = parseInt(splitID[1]);

            // 1- delete the item from the data structure
            budgetCtrl.deleteItem(type, id);

            // 2- delete the item form the UI
            UICtrl.deleteListItem(itemID);

            // 3- update and show the new budget
            updateBudget();

            // 4- calculate and update percentages
            updatePrecentage();
        }

    };

    return {
        init: function () {
            console.log('Application has started.');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                precentage: 0,
            })
            setupEventListeners();
        },
    };

})(budgetController, UIController);
controller.init();




// chunks قطع
// attempt محاولة
// so forth وهكذا
// weird عجيب او غريب
// principle مبدأ أو  قاعدة
// illustrate توضيح او تفسير
// retrieves يرجع او يسترد 
// coerce اجبار او اكراه
// ingredients مكونات 
// recap خلاصة
// isolate عزل
// proper formatting تنسيق مناسب
// preserve الحفاظ علي 
// aggregate مجموع / اجمالي 
// surrounding المحيط
// convince اقناع
// convenient مناسب
// impractical غير عملي 
// corresponding مطابق او متماثل
// whether سواء
// obviously بوضوح
// exclude استبعاد او منع
// defer تأجيل
// as well as بالاطافة الي ذلك
// competitive تنافس
// sequence تسلسل او تتابع
// demonstrate شرح او اثبات او برهان


// querySelectorAll Return a NodeList

// Math.round(2.5) = 3
// Math.pow(4,3) = 64
// Math.abs(-2) = 2