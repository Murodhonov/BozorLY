var page = 1;
var max_page = Math.ceil(products.length / 20);
console.log(max_page);
var category = [];
var new_data = products;
var cart = [];

console.log(categories);

$(document).ready(() => {
  let old_cart = window.localStorage.getItem('product_cart')
  old_cart = JSON.parse(old_cart)
  if(old_cart!=null){
    cart = old_cart
  }
  getData();
  getCategories();
  $(".search-input").on("input", function () {
    showToast("Coming Soon!");
  });
});

const showToast = (message) => {
  $("#toast-body").text(message);
  $(".toast").toast("show");
};

function getCategories() {
  categories.map((item, key) => {
    $(".categories").append(
      `<li onclick="editCategory(${key})"><input type="checkbox" class="category category_${key}"><span>${item.name}</span></li>`
    );
  });
}

function editCategory(key) {
  if (key != "all") {
    var a = category.findIndex((x) => x == categories[key].slug);
    console.log(a);
    console.log($(`.category_${key}`));

    if (a == -1) {
      category.push(categories[key].slug);
      $(`.category_${key}`).prop("checked", true);
    } else {
      category.splice(a, 1);
      $(`.category_${key}`).prop("checked", false);
    }

    if (category.length == 0 || category.length === categories.length) {
      $(".category_all").prop("checked", true);
    } else {
      $(".category_all").prop("checked", false);
    }
  } else {
    category = [];
    $(".category").prop("checked", false);
    $(".category_all").prop("checked", true);
  }
  console.log(category);
  page = 1;
  if (category.length == 0) {
    new_data = products;
  } else {
    new_data = products.filter(
      (x) => category.findIndex((y) => y === x.category) != -1
    );
  }
  max_page = Math.ceil(new_data.length / 20);
  getData();
}

const getData = () => {
  console.log(products);
  if (page === 1) {
    $(".big_data").html("");
  }

  new_data.slice((page - 1) * 20, (page - 1) * 20 + 20).map((item, key) => {
    if (item.discountPercentage != 0 && item.discountPercentage != null) {
      var str = `<p class="card-text"><del>$${item.price}</del>  <span>${(
        item.price -
        (item.price * item.discountPercentage) / 100
      ).toFixed(2)}</span> </p>`;
    } else {
      var str = `<p class="card-text">$${item.price}</p>`;
    }

    let added = cart.findIndex(x=>x.id===item.id) != -1

    $(".big_data").append(`<div class="col-lg-3 col-md-6 col-sm-12">
                <div class="card card_${item.id}">
                    <img src="${item.thumbnail}" class="card-img-top" alt="...">
                    <div class="card-body">
                      <h5 class="card-title">${item.title}</h5>
                      <div class="card_price">
                      ${str} 
                      <button onclick="editCart(${item.id})" class="btn btn_cart ${added?'btn_card_active':''}">
                      ${added?'<i class="fa fa-minus"></i>':'<i class="fa fa-cart-plus"></i>'}
                      </button>
                      </div>
                    </div>
                  </div>
            </div>`);
  });

  if (page < max_page) {
    $(".addBtnBox").html(
      `<button onclick="readNewPage()" class="btn addBtn" > Show more </button>`
    );
  } else {
    $(".addBtnBox").html(" ");
  }
};

const getCartData = () => {
  console.log(cart);
  $(".cart_data").html(""); 
  let totalPrice = 0;

  if (cart.length === 0) {
    $(".cart_data").html(`
      <div class="text-center empty-cart">
        <i class="fa fa-shopping-cart fa-3x text-muted"></i>
        <p class="mt-3 text-muted">Your cart is empty</p>
      </div>
    `);
    $("#totalPrice").text("0.00");  
    return;
  }

  cart.map((item) => {
    let finalPrice = item.price;
    let str;

    if (item.discountPercentage != 0 && item.discountPercentage != null) {
      finalPrice = (item.price - (item.price * item.discountPercentage) / 100).toFixed(2);
      str = `<p class="card-text"><del>$${item.price}</del>  
             <span>$${finalPrice}</span> 
            </p>`;
    } else {
      str = `<p class="card-text">$${item.price}</p>`;
    }

    totalPrice += parseFloat(finalPrice) * item.count;

    let image_item = products.findIndex(x => item.id == x.id);

    $(".cart_data").append(`
      <div class="col-lg-3 col-md-6 col-sm-12">
        <div class="card card_${item.id}">
          <img src="${products[image_item].thumbnail}" class="card-img-top" alt="...">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <div class="card_price">
              ${str} 
              <div class="quantity-control">
                <button onclick="changeQuantity(${item.id}, -1)" class="btn btn-sm btn-danger">-</button>
                <span class="item-count">${item.count}</span>
                <button onclick="changeQuantity(${item.id}, 1)" class="btn btn-sm btn-success">+</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `);
  });

  $("#totalPrice").text(totalPrice.toFixed(2)); 

  $("#purchaseNow").off("click").on("click", () => {
    let botToken = "7379724923:AAGvyEkjw2U45cZnlwCOUp10-2ZiIzJYQls"; // Your bot token
    let chatId = "866966867"; // Your chat ID
    let apiUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
  
    let message = "🛒 *New Purchase* 🛒\n\n";
    cart.forEach(item => {
      message += `🛍️ *Product:* ${item.title}\n`;
      message += `📦 *Quantity:* ${item.count}\n`;
      message += `💰 *Cost:* $${(item.count * item.price).toFixed(2)}\n\n`;
    });
  
    message += `📊 *Total Price:* $${totalPrice.toFixed(2)}`;
  
    fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: "Markdown"
      })
    })
    .then(response => response.json())
    .then(data => {
      if (data.ok) {
        customAlert("✅ Order sent successfully!");
      } else {
        customAlert("❌ Failed to send order.");
      }
    })
    .catch(error => {
      console.error("Error:", error);
      customAlert("🚨 Error sending order.");
    });
  
    cart = [];  
    getCartData();  
    window.localStorage.setItem('product_cart', JSON.stringify(cart));
  });
  
};

const changeQuantity = (id, num) => {
  let itemIndex = cart.findIndex(x => x.id === id);
  if (itemIndex !== -1) {
    cart[itemIndex].count += num;
    if (cart[itemIndex].count <= 0) {
      cart.splice(itemIndex, 1);
    }
  }
  getCartData();
  window.localStorage.setItem('product_cart', JSON.stringify(cart));
};



const cart_list_show=()=>{
  getCartData()
}

const readNewPage = () => {
  if (page < max_page) {
    page++;
    getData();
  }
};

const editCart=(id)=>{
  console.log("I am here")
  let prod = products.find(x=>x.id==id)
  let a = cart.findIndex(x=>x.id === id)

  if(a==-1){
    let config = {
      id:prod.id,
      title:prod.title,
      count:1,
      image:prod.thumbnail
    }

    if(prod.discountPercentage != 0 && prod.discountPercentage != null){
      config.price = (prod.price -
        (prod.price * prod.discountPercentage) / 100
      ).toFixed(2)
    }else{
      config.price = prod.price
    }

    cart.push(config)

    $(`.card_${id} .btn_cart`).html('<i class="fa fa-minus" aria-hidden="true"></i>')
    $(`.card_${id} .btn_cart`).addClass('btn_card_active')
  }else{
    cart.splice(a,1)
    $(`.card_${id} .btn_cart`).html('<i class="fa fa-cart-plus" aria-hidden="true"></i>')
    $(`.card_${id} .btn_cart`).removeClass('btn_card_active')
  }
  getCartData()
  console.log(cart)
  window.localStorage.setItem('product_cart',JSON.stringify(cart))
}