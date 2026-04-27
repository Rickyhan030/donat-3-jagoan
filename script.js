/* =========================
   PRODUCTS DATABASE
========================= */
const products = [
{
    id: 1,
    name: "Donat",
    type: "variant",
    variants: [
        { name: "Coklat", price: 5000 },
        { name: "Keju", price: 5000 },
        { name: "Strawberry", price: 5000 },
        { name: "Matcha", price: 5000 }
    ]
},
{
    id: 2,
    name: "Bolu",
    type: "single",
    price: 20000
},
{
    id: 3,
    name: "Pizza",
    type: "variant",
    variants: [
        { name: "Small", price: 20000 },
        { name: "Regular", price: 45000 }
    ]
},
{
    id: 4,
    name: "Kue",
    type: "single",
    price: 20000
}
];

/* =========================
   CART SYSTEM
========================= */
let cart = JSON.parse(localStorage.getItem("cart")) || [];

function saveCart(){
    localStorage.setItem("cart", JSON.stringify(cart));
}

/* =========================
   STATE MODAL
========================= */
let selectedProduct = null;
let selectedVariant = null;

/* =========================
   OPEN PRODUCT
========================= */
function openProduct(id){

    selectedProduct = products.find(p => p.id === id);
    selectedVariant = null;

    document.getElementById("modal").style.display = "block";
    document.getElementById("modalTitle").innerText = selectedProduct.name;

    let list = document.getElementById("variantList");
    list.innerHTML = "";

    if(selectedProduct.type === "variant"){
        selectedProduct.variants.forEach((v,i)=>{
            list.innerHTML += `
                <button onclick="selectVariant(${i})">
                    ${v.name} - Rp ${v.price.toLocaleString()}
                </button>
            `;
        });
    } else {
        list.innerHTML = "<p>Produk tanpa varian</p>";
    }
}

/* =========================
   SELECT VARIANT
========================= */
function selectVariant(i){
    selectedVariant = selectedProduct.variants[i];
}

/* =========================
   ADD PRODUCT (MODAL)
========================= */
function confirmAdd(){

    let qty = parseInt(document.getElementById("qty").value || 1);

    if(!selectedProduct) return;

    let id = selectedProduct.id;
    let name = selectedProduct.name;
    let price = selectedProduct.price;
    let variant = null;

    if(selectedVariant){
        name = `${selectedProduct.name} (${selectedVariant.name})`;
        price = selectedVariant.price;
        variant = selectedVariant.name;
    }

    let item = cart.find(i => i.id === id && i.variant === variant);

    if(item){
        item.qty += qty;
    } else {
        cart.push({
            id,
            name,
            price,
            qty,
            variant
        });
    }

    saveCart();
    renderCart();

    // 🔥 AUTO CLOSE MODAL (FIX BUG)
    closeModal();

    showNotif(name + " ditambahkan");
}

/* =========================
   ADD PRODUCT DIRECT
========================= */
function addProduct(id){

    let p = products.find(x => x.id === id);

    let item = cart.find(i => i.id === id && !i.variant);

    if(item){
        item.qty += 1;
    } else {
        cart.push({
            id: p.id,
            name: p.name,
            price: p.price,
            qty: 1,
            variant: null
        });
    }

    saveCart();
    renderCart();

    showNotif(p.name + " ditambahkan");
}

/* =========================
   CLOSE MODAL
========================= */
function closeModal(){
    document.getElementById("modal").style.display = "none";
}

/* =========================
   RENDER CART
========================= */
function renderCart(){

    const list = document.getElementById("cartList");
    const totalEl = document.getElementById("total");

    if(!list || !totalEl) return;

    list.innerHTML = "";

    if(cart.length === 0){
        list.innerHTML = "<li style='text-align:center;color:#999;'>Keranjang kosong</li>";
        totalEl.innerText = "Total: Rp 0";
        return;
    }

    let total = 0;

    cart.forEach((item,index)=>{
        let sub = item.price * item.qty;
        total += sub;

        list.innerHTML += `
        <li style="display:flex;justify-content:space-between;align-items:center;">
            <div>
                <b>${item.name}</b><br>
                <small>Rp ${item.price.toLocaleString()}</small>
            </div>

            <div>
                x${item.qty}
                <button onclick="removeItem(${index})">❌</button>
            </div>
        </li>
        `;
    });

    totalEl.innerText = "Total: Rp " + total.toLocaleString();
}

/* =========================
   REMOVE ITEM
========================= */
function removeItem(index){
    cart.splice(index,1);
    saveCart();
    renderCart();
}

/* =========================
   CHECKOUT WHATSAPP
========================= */
function checkout(){

    if(cart.length === 0){
        alert("Keranjang kosong!");
        return;
    }

    let nama = document.getElementById("nama")?.value || "-";
    let alamat = document.getElementById("alamat")?.value || "-";

    // simpan auto (PRO)
    localStorage.setItem("nama", nama);
    localStorage.setItem("alamat", alamat);

    const nomor = "6282110677862";

    let msg = "*🧾 PESANAN ENAK.EFOODIES*\n\n";

    msg += "*Nama:* " + nama + "\n";
    msg += "*Alamat:* " + alamat + "\n\n";

    let total = 0;

    cart.forEach(item=>{
        let sub = item.price * item.qty;
        total += sub;

        msg += `• ${item.name}\n`;
        msg += `${item.qty} x Rp ${item.price.toLocaleString()}\n`;
        msg += `= Rp ${sub.toLocaleString()}\n\n`;
    });

    msg += "----------------------\n";
    msg += "*TOTAL: Rp " + total.toLocaleString() + "*";

    window.open("https://wa.me/"+nomor+"?text="+encodeURIComponent(msg));
}

/* =========================
   NOTIF
========================= */
function showNotif(msg){
    let notif = document.getElementById("notif");

    if(!notif){
        notif = document.createElement("div");
        notif.id = "notif";
        notif.style.position = "fixed";
        notif.style.top = "20px";
        notif.style.right = "20px";
        notif.style.background = "#25d366";
        notif.style.color = "#fff";
        notif.style.padding = "10px 15px";
        notif.style.borderRadius = "10px";
        notif.style.zIndex = "9999";
        document.body.appendChild(notif);
    }

    notif.innerText = "✔ " + msg;
    notif.style.display = "block";

    setTimeout(()=>{
        notif.style.display = "none";
    },2000);
}

/* =========================
   AUTO LOAD DATA (PRO)
========================= */
document.addEventListener("DOMContentLoaded", () => {
    renderCart();

    // auto isi nama & alamat
    if(document.getElementById("nama")){
        document.getElementById("nama").value = localStorage.getItem("nama") || "";
    }

    if(document.getElementById("alamat")){
        document.getElementById("alamat").value = localStorage.getItem("alamat") || "";
    }
});
