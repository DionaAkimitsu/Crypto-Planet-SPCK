const getHumanAvatar = () => `https://xsgames.co/randomusers/avatar.php?g=male`; 
const isLoggedIn = () => localStorage.getItem("loggedInUser") !== null;
 
const loginBtn = document.getElementById("login-btn"); 
const logoutBtn = document.getElementById("logout-btn");
const loginSection = document.getElementById("login-section"); 
const usernameDisplay = document.getElementById("username-display"); 
const avatarDisplay = document.getElementById("avatar-display"); 
const loginButton = document.getElementById("login-btn"); 

function updateNavbar() {
     if (isLoggedIn()) {
         const username = localStorage.getItem("loggedInUser");
         const avatar = localStorage.getItem("userAvatar"); 
         usernameDisplay.innerText = username; avatarDisplay.src = avatar; 
         loginButton.style.display = "none"; 
         loginSection.style.display = "flex"; 
         loginBtn.style.display = "none"; 
        }
     else { 
        loginSection.style.display = "none"; 
        loginBtn.style.display = "inline-block"; 
    } 
}


function logout() {
     localStorage.removeItem("loggedInUser"); 
     localStorage.removeItem("userAvatar"); 
     alert("🚀 Đã đăng xuất!"); 
     updateNavbar(); 
     window.location.href = "login.html"; 
}

let balance = 0; 

function depositMoney() {
    const amount = parseFloat(document.getElementById("amount").value);
    const method = document.getElementById("payment-method").value;
    const balanceDisplay = document.getElementById("balance");
    const statusMessage = document.getElementById("status-message");

    if (!amount || amount <= 0) {
        alert("❌ Vui lòng nhập số tiền hợp lệ!");
        return;
    }

    balance += amount; // 🟢 Cộng tiền vào số dư tài khoản
    balanceDisplay.innerText = `$${balance.toFixed(2)}`; // 🟢 Cập nhật hiển thị

    const message = `✅ Đã nạp thành công $${amount} bằng ${method}`;
    
    alert(message); // 🟢 Hiển thị thông báo bằng `alert()`
    statusMessage.innerText = message;

    console.log(`✅ Đã cập nhật số dư: $${balance.toFixed(2)}`);
}




let allMarketData = []; 
let favoriteCoins = JSON.parse(localStorage.getItem('favoriteCoins')) || [];
let visibleCoins = 50; 
async function fetchMarketData() {
     try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
         if (!response.ok) throw new Error(`⚠ Lỗi API: ${response.status}`);
          const data = await response.json(); if (!Array.isArray(data) || data.length === 0) 
            throw new Error("⚠ Không có dữ liệu từ API.");
        allMarketData = data;
        allMarketData.forEach(coin => localStorage.setItem(`coin_${coin.symbol}`, JSON.stringify(coin)));
         console.log("✅ Đã lấy dữ liệu từ API:", allMarketData.slice(0, 5)); 
        updateMarketTable();
        updateTopGainers();

        }
        catch
         (error) { console.error("❌ Lỗi khi lấy dữ liệu từ CoinGecko:", error);

        }
}

async function fetchFavoriteData() {
     try {
        const response = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd");
         if (!response.ok) throw new Error(`⚠ Lỗi API: ${response.status}`);
          const data = await response.json(); if (!Array.isArray(data) || data.length === 0) 
            throw new Error("⚠ Không có dữ liệu từ API.");
        allMarketData = data;
        allMarketData.forEach(coin => localStorage.setItem(`coin_${coin.symbol}`, JSON.stringify(coin)));
         console.log("✅ Đã lấy dữ liệu từ API:", allMarketData.slice(0, 5)); 

        updateFavoriteCoins();

        }
        catch
         (error) { console.error("❌ Lỗi khi lấy dữ liệu từ CoinGecko:", error);

        }
}

function toggleFavorite(coinId) {
     const index = favoriteCoins.indexOf(coinId); 
     if (index === -1){ 
        favoriteCoins.push(coinId); 

    } 
     else { favoriteCoins.splice(index, 1); } localStorage.setItem('favoriteCoins', JSON.stringify(favoriteCoins));
      updateMarketTable(); 
    }

function reorderFavorites(data) {
 if (!favoriteCoins.length) return data;
    return data.sort((a, b) => { const indexA = favoriteCoins.indexOf(a.id);
     const indexB = favoriteCoins.indexOf(b.id);
    return (indexA === -1 ? Infinity : indexA) - (indexB === -1 ? Infinity : indexB); });
}

function updateMarketTable() { 
    const tableBody = document.getElementById("market-data");
    const favoriteTable = document.getElementById("favorite-coins");
    tableBody.innerHTML = "";
    const sortOption = document.getElementById("sortOption")?.value || "alphabet-asc";
    const sortedData = [...allMarketData].sort((a, b) => {
         switch (sortOption) { 
            case "alphabet-asc": 
                return a.symbol.localeCompare(b.symbol);
            case 
             "alphabet-desc": 
                return b.symbol.localeCompare(a.symbol); 
            case 
             "price-asc": 
                return a.current_price - b.current_price;
            case 
              "price-desc": 
                return b.current_price - a.current_price; 
            case 
            "change-asc": 
                return a.price_change_percentage_24h - b.price_change_percentage_24h;
               case 
            "change-desc": 
                return b.price_change_percentage_24h - a.price_change_percentage_24h; 
            default: 
                return 0; 
} });

    const data = reorderFavorites(sortedData); 
    data.forEach(coin => { const isFavorite = favoriteCoins.includes(coin.id);
    const starIcon = isFavorite ? '⭐' : '☆'; 
    const row = document.createElement('tr');
    row.innerHTML = ` 
            <td><img src="${coin.image}" width="30">
            </td> <td>${coin.symbol.toUpperCase()} / ${coin.name}</td> 
            <td>$${coin.current_price.toFixed(2)}</td> 
            <td>${coin.price_change_percentage_24h.toFixed(2)}%</td> 
            <td class="favorite-icon">
            <button onclick="toggleFavorite('${coin.id}')">${starIcon}</button></td> `;
            tableBody.appendChild(row);
    });
}

function updateFavoriteCoins() {
    const favoriteTable = document.getElementById("favorite-coins");

    if (!favoriteTable) {
        console.error("❌ Không tìm thấy bảng danh sách yêu thích!");
        return;
    }

    favoriteTable.innerHTML = ``;

    let sortedData = reorderFavorites(allMarketData);

    sortedData.forEach(coin => {
        const isFavorite = favoriteCoins.includes(coin.id);
        const starIcon = isFavorite ? '⭐' : '☆';

        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${coin.image}" width="30"></td>
            <td><strong>${coin.symbol.toUpperCase()}</strong> / ${coin.name}</td>
            <td>$${coin.current_price.toFixed(2)}</td>
            <td>${coin.price_change_percentage_24h.toFixed(2)}%</td>
            <td class="favorite-icon">
                <button onclick="toggleFavorite('${coin.id}')">${starIcon}</button>
            </td>
        `;

        favoriteTable.appendChild(row);
    });

    console.log("✅ Đã cập nhật danh sách coin yêu thích trên trang chủ.");
}

function updateTopGainers() {
    const topGainersTable = document.getElementById("top-gainers");

    if (!topGainersTable) {
        console.error("❌ Không tìm thấy bảng Top 5 tăng trưởng!");
        return;
    }

    topGainersTable.innerHTML = `
        <tr>
            <th>#</th>
            <th>Coin</th>
            <th>Giá</th>
            <th>Biến động (%)</th>
        </tr>
    `;

    let topGainers = allMarketData.filter(coin => coin.price_change_percentage_24h > 0)
        .sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h)
        .slice(0, 5);

    if (!topGainers.length) {
        topGainersTable.innerHTML += `<tr><td colspan="4">❌ Không có coin tăng trưởng!</td></tr>`;
        return;
    }

    topGainers.forEach(coin => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${coin.image}" width="30"></td>
            <td><strong>${coin.symbol.toUpperCase()}</strong> / ${coin.name}</td>
            <td>$${coin.current_price.toFixed(2)}</td>
            <td>${coin.price_change_percentage_24h.toFixed(2)}%</td>
        `;
        topGainersTable.appendChild(row);
    });

    console.log("✅ Đã cập nhật danh sách Top 5 tăng trưởng.");
}


window.addEventListener("load", updateTopGainers);

window.addEventListener("load", updateFavoriteCoins);     


function loadMoreCoins() {
     visibleCoins = allMarketData.length; updateMarketTable(); 
     document.getElementById("loadMoreBtn").style.display = "none"; 
}

function login() {
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();
       if (!username || !password) { 
            showPopup("❌ Vui lòng nhập đầy đủ thông tin.");
         return;
         } 
        let avatar = localStorage.getItem("userAvatar") || getHumanAvatar(); 
        localStorage.setItem("userAvatar", avatar);
        localStorage.setItem("loggedInUser", username);
        showPopup("✅ Đăng nhập thành công!"); 
        setTimeout(() => { window.location.href = "index.html"; }, 1500);
} 
         function showPopup(message) {
             document.getElementById("popup-message").innerText = message;
              document.getElementById("popup").style.display = "flex"; 
            }
         function closePopup() {
             document.getElementById("popup").style.display = "none"; 
            } 
        function register() {
            const username = document.getElementById("new-username").value;
            const password = document.getElementById("new-password").value;
             if (username && password) { localStorage.setItem("loggedInUser", username);
                 localStorage.setItem("userAvatar", getHumanAvatar()); showPopup("✅ Đăng ký thành công! Bạn sẽ được chuyển về trang chủ.");
                 setTimeout(() => { window.location.href = "index.html"; }, 2000); } else { showPopup("❌ Vui lòng nhập đầy đủ thông tin.");

                  } 
                } 
function toggleMenu() {
     const menu = document.getElementById("menu-content"); menu.style.display = menu.style.display === "block" ? "none" : "block"; 
    }

window.addEventListener("load", () => { updateNavbar(); fetchMarketData(); });


const coinCategories = {
    "bitcoin": "layer1",
    "ethereum": "smart-contract",
    "solana": "smart-contract",
    "cardano": "smart-contract",
    "dogecoin": "meme",
    "shiba-inu": "meme",
    "pepe": "meme",
    "uniswap": "defi",
    "aave": "defi",
    "curve-dao-token": "defi",
    "usdt": "stablecoin",
    "usdc": "stablecoin",
    "dai": "stablecoin",
    "avalanche": "layer1",
    "near-protocol": "layer1"
};

function filterCoins() {
    const searchText = document.getElementById("filterCoins").value.toLowerCase().trim();
    const selectedCategory = document.getElementById("categorySelect").value;
    const filteredTable = document.getElementById("market-data");

    filteredTable.innerHTML = `    `;


    let filteredCoins = selectedCategory === "all"
        ? allMarketData
        : allMarketData.filter(coin => coinCategories[coin.id] === selectedCategory);


    filteredCoins = filteredCoins.filter(coin =>
        coin.symbol.toLowerCase().includes(searchText) || coin.name.toLowerCase().includes(searchText)
    );

    if (!filteredCoins.length) {
        filteredTable.innerHTML += `<tr><td colspan="4">❌ Không tìm thấy coin phù hợp!</td></tr>`;
        return;
    }

    filteredCoins.forEach(coin => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${coin.image}" width="30"></td>
            <td><strong>${coin.symbol.toUpperCase()}</strong> / ${coin.name}</td>
            <td>$${coin.current_price.toFixed(2)}</td>
            <td>${coin.price_change_percentage_24h.toFixed(2)}%</td>
        `;
        filteredTable.appendChild(row);
    });

    console.log(`✅ Đã lọc danh sách theo từ khóa "${searchText}" và danh mục "${selectedCategory}"`);
}


document.getElementById("filterCoins").addEventListener("input", filterCoins);
document.getElementById("categorySelect").addEventListener("change", filterCoins);

document.getElementById("support-form").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const message = document.getElementById("message").value.trim();

    if (!name || !email || !message) {
        alert("❌ Vui lòng điền đầy đủ thông tin!");
        return;
    }

    alert(`✅ Yêu cầu hỗ trợ đã được gửi!\nTên: ${name}\nEmail: ${email}\nNội dung: ${message}`);
});

setInterval(fetchMarketData, 30000);