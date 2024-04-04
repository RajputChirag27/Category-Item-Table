const categoryModal = new bootstrap.Modal(      // Category Modal
    document.getElementById("modalId"),
);

const itemModal = new bootstrap.Modal(          // Item Modal
    document.getElementById("modalId1"),
);

let categoryTable;
let categoryData;
let itemTable;
let itemData;
let categoryDataObject;
const categoryDataArray = [];
const categoryForm = document.getElementById('categoryForm');
const itemForm = document.getElementById('itemForm');
const categoryTypeArr = [];
let categorySet = new Set();
let itemSet = new Set();
const categoryTypeDynamic = document.getElementById('categoryTypeDynamic');




// Document Ready Code
$(document).ready(function () {
    $('#categoryForm').parsley();
    $('#itemForm').parsley();
    categoryTable = $('#categoryTable').DataTable();



    $('#categoryForm').on('submit', (e) => {
        e.preventDefault();
        categoryData = new FormData(categoryForm);
        categoryDataObject = Object.fromEntries(categoryData);      // Category Data Object
        console.log(categoryDataObject)
        categoryDataObject.itemObject = [];
        if (!isDateValid(categoryDataObject.launchDate)) {
            e.preventDefault();
            $("#launchDateError").removeClass('hidden')
            return;
        }
        $("#launchDateError").addClass('hidden')
        if (!categorySet.has(categoryDataObject.categoryName)) {        // Checking for the Duplicate Entry in the set
            categorySet.add(categoryDataObject.categoryName)
            categoryDataArray.push(categoryDataObject)
            categoryTypeArr.push(categoryDataObject.categoryName);  // Pushing Data to the fields
        } else {
            alert("Category already exists!");
            return
        }
        console.log(categoryDataArray);


        mapIntoItems();  // Map the data into ItemForm
        createTable();  // Create or Draw the table
        resetFields(); //  Reset Fields

    });

    $('#itemForm').on('submit', (e) => {
        e.preventDefault();
        itemData = new FormData(itemForm);
        const itemObj = Object.fromEntries(itemData);   // Creating an object from form
        console.log(itemObj);

        const existingIndex = categoryDataArray.findIndex(obj => obj.categoryName === itemObj.categoryTypeDynamic)

        if (existingIndex === -1) {
            console.log("Index Not Found");
        } else {
            const objPush = categoryDataArray.find(obj => obj.categoryName === itemObj.categoryTypeDynamic);
            if (objPush) {
                if (!itemSet.has(itemObj.itemName)) {        // Checking for the Duplicate Entry in the set
                    itemSet.add(itemObj.itemName)
                    objPush.itemObject.push(itemObj)
                    // Pushing Data to the fields
                } else {
                    alert("Item already exists!");
                    return
                }

            }
        }
        console.log(categoryDataArray)
        resetFields();
    })

});


const mapIntoItems = () => {     // Map the data into ItemForm 
    $('#categoryTypeDynamic').html(
        categoryTypeArr.map(data =>
            ` <option value="${data}">${data}</option>`
        ).join('')
    )
}


const resetFields = () => {  // Resetting the form
    // Resetting Category Form
    categoryForm.reset();
    categoryModal.hide();
    // Resetting Item Form
    itemForm.reset();
    itemModal.hide();


}

const isActive = (launchDate) => {      // Function for finding if the item is Active or not
    const currDate = new Date();
    const launchDateObj = new Date(launchDate);

    return (currDate - launchDateObj) / (24 * 60 * 60 * 1000) >= 7 ? "Old" : "New";  // Older than 7 Validation
}

const isDateValid = (launchDate) => {
    const currDate = new Date();
    const launchDateObj = new Date(launchDate);

    return (launchDateObj > currDate) ? false : true;
}


const deleteRow = (button) => {
    const tr = $(button).closest('tr'); // Find closest tr
    const valueToDelete = $(tr).find('td:eq(1)').text(); // Find row to be deleted based on the table

    const resultIdx = categoryTypeArr.indexOf(valueToDelete); // Finding Index to remove for category Type Arr
    const resultIdx1 = categoryDataArray.findIndex(obj => obj.categoryName === valueToDelete); // Finding Index to remove from categoryDataArray

    if (resultIdx1 !== -1 && resultIdx !== -1) {
        console.log(categoryDataArray[resultIdx1].itemObject.map(obj => obj.itemName));

        let itemsToDelete = (categoryDataArray[resultIdx1].itemObject.map(obj => obj.itemName));
        itemsToDelete.forEach(item => {
            itemSet.delete(item);
        })

        categoryDataArray[resultIdx1].itemObject.length = 0;

        categoryTypeArr.splice(resultIdx, 1); // Deleted Data from categoryTypeArr
        categoryDataArray.splice(resultIdx1, 1);  // Deleted Data from categoryDataArray
        categorySet.delete(valueToDelete);  // Deleted Data from Set 

        console.log(categoryDataArray);
        console.log(categoryTypeArr);

        // Redraw the DataTable after all modifications are done
        createTable();
        mapIntoItems();
    } else {
        console.log(`Category name '${valueToDelete}' not found.`);
    }
}


// Child Row Delete Function ........
const deleteChildRow = (button) =>{
    let tr = $(button).closest('tr');
    let parentTr = tr.parent().parent().siblings();
    let parentValue = ($(parentTr).find('td:eq(1)').text())
    const resultIdx1 = categoryDataArray.findIndex(obj => obj.categoryName === parentValue);
    const valuetoDelete = $(tr).find('td:eq(0)').text();
    console.log(valuetoDelete)

    if(resultIdx1 !== -1){
      const idxtoDelete =  categoryDataArray[resultIdx1].itemObject.findIndex(item => item.itemName === valuetoDelete);
      categoryDataArray[resultIdx1].itemObject.splice(idxtoDelete,1);

      console.log(categoryDataArray);
      createTable();
    } else {
        console.log(`Item Name ${idxtoDelete} not found.`);
    }


}



const addRow = (button) => {
    var tr = $(button).closest('tr'); // Find closest row
    var row = categoryTable.row(tr);

    if (row.child.isShown()) {
        // This row is already open - close it
        row.child.hide();
        tr.removeClass('shown');
    } else {
        // Open this row
        // Find the category name of the current row
        var categoryName = row.data()[1]; // Assuming categoryName is in the second column (index 1)

        // Find the index of the object in categoryDataArray with the matching categoryName
        var index = categoryDataArray.findIndex(obj => obj.categoryName === categoryName);

        // Pass the corresponding object containing itemObject to the format function
        if (index !== -1) {
            row.child(format(categoryDataArray[index])).show();
        } else {
            console.error('Category not found:', categoryName);
        }
        tr.addClass('shown');
    }
}

const createTable = () => {
    categoryTable.clear(); // Clear existing data
    categoryDataArray.forEach(obj => {
        const row = categoryTable.row.add([
            `<button class="btn btn-primary" class="addRowBtn" onclick="addRow(this)">+</button>`,
            obj.categoryName,
            obj.categoryDescription,
            obj.categoryActive,
            isActive(obj.launchDate),
            `
            <button class="btn btn-primary"><i class="fa fa-edit" aria-hidden="true"></i></button>
            <button class="btn btn-danger" onclick="deleteRow(this)"><i class="fa fa-remove" aria-hidden="true"></i></button>
            `
        ]); // Show child rows
    });
    categoryTable.draw(); // Draw the table
}



const format = (rowData) => {
    console.log(rowData)
    let html = '';

    // Check if rowData is defined
    if (rowData && rowData.itemObject && Array.isArray(rowData.itemObject)) {
        // Loop through each item in the itemObject array
        html = `
        <tr>
    <th style="width: 15rem;">Item Name</th>
    <th style="width: 15rem;">Food Type</th>
    <th style="width: 15rem;">Item Price</th>
    <th style="width: 15rem;">Item Discount</th>
    <th style="width: 15rem;">Item GST</th>
    <th style="width: 15rem;">Price GST(incl)</th>
    <th style="width: 15rem;">Final Price</th>
    <th style="width: 15rem;">Actions</th>
</tr>
        `
        rowData.itemObject.forEach(item => {
            html += `
                <tr>
                    <td style="width: 15rem;">${item.itemName}</td>
                    <td style="width: 15rem;">${item.foodType}</td> <!-- Placeholder for Food Type -->
                    <td style="width: 15rem;">₹${item.itemPrice}</td>
                    <td style="width: 15rem;">${item.itemDiscount}%</td>
                    <td style="width: 15rem;">${item.itemGST}%</td>
                    <td style="width: 15rem;">₹${Number(item.itemPrice) + (Number(item.itemPrice) * Number(item.itemGST) / 100)}</td>
                    <td style="width: 15rem;">₹${Math.round((Number(item.itemPrice) + (Number(item.itemPrice) * Number(item.itemGST) / 100)) - ((Number(item.itemPrice) + (Number(item.itemPrice) * Number(item.itemGST) / 100)) * Number(item.itemDiscount) / 100))}</td>
                    <td style="width: 15rem;">    
                    <button class="btn btn-primary"><i class="fa fa-edit" aria-hidden="true"></i></button>
                        <button class="btn btn-danger" onclick="deleteChildRow(this)"><i class="fa fa-remove" aria-hidden="true"></i></button>
                    </td>
                </tr>
            `;
        });
    } else {
        console.error('Invalid or missing itemObject property in rowData:', rowData);
    }
    return html;
};


