//单件商品
class UIGoods {
    constructor(data) {
        this.data = data;
        // 顾客选择了几个商品，用choose属性表示【需要网络获取】
        this.choose = 0;
    }

    // 通过函数计算总价，每次需要计算就调用这个函数。
    getTotalPrice() {
        return this.data.price * this.choose;
    }

    // 是否选中了此件商品，只有调用返回true/false
    isChoose() {
        return this.choose > 0;
    }

    // 增加商品
    increase() {
        this.choose++;
    }

    // 减少商品
    decrease() {
        if (this.choose === 0) return;
        this.choose--;
    }
}

// 整个界面上的数据
class UIData {
    constructor() {
        let uiGoods = [];
        // 通过循环把带有【choose+原始】的数据放在了uiGoods数组中。
        for (let i = 0; i < goods.length; i++) {
            let uig = new UIGoods(goods[i]);
            uiGoods.push(uig);
        }
        this.uiGoods = uiGoods;
        // 起送门槛【需要网络获取】
        this.deliveryThreshold = 30;
        // 起送费
        this.deliveryPrice = 25;
    }

    // 所有的商品总价（挑选的所有商品 + 商品单价）
    getTotalPrice() {
        return this.uiGoods.reduce((p, c) => {
            return p + (c.data.price * c.choose)
        }, 0)
    }

    // 增加某件商品的选中数量（避免操作里面的东西，操作外面的包装）
    increase(index) {
        this.uiGoods[index].increase();
    }

    // 减少某件商品的选中数量
    decrease(index) {
        this.uiGoods[index].decrease();
    }

    // 得到总共的选择数量
    getTotalChooseNumber() {
        return this.uiGoods.reduce((p, c) => {
            return p + c.choose
        }, 0)
    }

    // 购物车中有没有东西
    hasGoodsInCart() {
        return this.getTotalChooseNumber() > 0;
    }

    // 判断是否达到起送标准
    isCrossDeliveryThreshold() {
        return this.getTotalPrice() >= this.deliveryThreshold;
    }

    // 判断是否选中
    isChoose(index) {
        return this.uiGoods[index].isChoose();
    }
}

// 整个界面
class UI {
    constructor() {
        this.uiData = new UIData();

        // 对象中收纳DOM元素，容易查找
        this.doms = {
            // 获取商品列表 goods-list
            goodsList: document.querySelector(".goods-list"),
            deliveryPrice: document.querySelector(".footer-cart-tip"),
            footerPay: document.querySelector(".footer-pay"),
            footerPayInnerSpan: document.querySelector(".footer-pay span"),
            footerCartTotal: document.querySelector(".footer-cart-total"),
            footerCart: document.querySelector(".footer-cart"),
            footerCartInnerSpan: document.querySelector(".footer-cart span"),
        };

        // getBoundingClientRect() 可以获取到元素所有的坐标信息
        // 目标坐标不会变，放在constructor中
        let cartRect = this.doms.footerCart.getBoundingClientRect();
        let cartRectTarget = {
            x: cartRect.left + cartRect.width / 2,
            y: cartRect.top + cartRect.height / 5
        }
        this.cartRectTarget = cartRectTarget;

        // 页面一加载就要生成dom，如果放在constructor中臃肿所以放在下面，这里只调用。
        this.createHTML();
        this.updateFooter();
        this.listener();
    }

    // 根据商品数据创建商品列表元素
    createHTML() {
        // 做法一：生成html字符串【执行效率低，开发效率高】，这里使用第一种方法。
        // 做法二：一个个创建元素【执行效率高，开发效率低】
        let html = this.uiData.uiGoods.map((item, index) => {
            return `
            <div class="goods-item">
                <img src="${item.data.pic}" alt="无法显示"/>
                <div class="goods-info">
                    <h2 class="goods-title">${item.data.title}</h2>
                    <p class="goods-desc">${item.data.desc}</p>
                    <p class="goods=sell">
                        <span>月售 ${item.data.sellNumber}</span>
                        <span>好评率 ${item.data.favorRate}</span>
                    </p>
                    <div class="goods-confirm">
                        <p class="goods-price">
                            <span class="goods-price-unit">￥</span>
                            <span>${item.data.price}</span>
                        </p>
                        <div class="goods-btns">
                            <i index="${index}" class="iconfont i-jianhao">-</i>
                            <span>${item.choose}</span>
                            <i index="${index}" class="iconfont i-jiajiangzujianjiahao">+</i>
                        </div>
                    </div>
                </div>
            </div>
            `
        })
        this.doms.goodsList.innerHTML = html;
    }

    // 增加商品改变显示状态
    increase(index) {
        this.uiData.increase(index);
        this.updateGoodsItem(index);
        this.updateFooter();
        this.parabola(index);
    }

    // 减少商品改变显示状态
    decrease(index) {
        this.uiData.decrease(index);
        this.updateGoodsItem(index);
        this.updateFooter();
        this.parabola(index);
    }

    // 更新某个商品元素的显示状态
    updateGoodsItem(index) {
        // 获取某条的goods-item
        let goodsItem = this.doms.goodsList.children[index];

        // 要不要加active
        if (this.uiData.isChoose(index)) {
            goodsItem.classList.add("active");
        } else {
            goodsItem.classList.remove("active");
        }

        // 变动按钮中span显示的选择数量
        let span = goodsItem.querySelector(".goods-btns span");
        span.textContent = this.uiData.uiGoods[index].choose;
    }

    // 更新页脚
    updateFooter() {
        // 总价
        let total = this.uiData.getTotalPrice();

        // 设置配送费
        this.doms.deliveryPrice.textContent = `配送费￥${this.uiData.deliveryPrice}`;

        // 是否达到起送，footer-pay的样式
        if (this.uiData.isCrossDeliveryThreshold()) {
            this.doms.footerPay.classList.add("active");
        } else {
            this.doms.footerPay.classList.remove("active");

            // 更新还差多少钱
            let short = this.uiData.deliveryThreshold - total;
            // 计算机算不好小数点，所以要四舍五入
            short = Math.round(short);
            this.doms.footerPayInnerSpan.textContent = `还差￥${short}起送`;
        }

        // 设置总价 toFixed(2)把数字保留小数点两位转为字符串
        this.doms.footerCartTotal.textContent = `${total.toFixed(2)}`;

        // 设置购物车的状态
        if (this.uiData.hasGoodsInCart()) {
            this.doms.footerCart.classList.add("active");
        } else {
            this.doms.footerCart.classList.remove("active");
        }

        // 设置购物车中的数量
        this.doms.footerCartInnerSpan.textContent = this.uiData.getTotalChooseNumber();
    }

    // 监听事件
    listener() {
        this.doms.footerCart.addEventListener("animationend", function () {
            this.classList.remove("animate");
        })
    }

    // 购物车动画
    createAnimate() {
        // 添加放大缩小动画，删除动画在animationend事件中
        this.doms.footerCart.classList.add("animate");
    }

    // 抛物线跳跃的元素
    parabola(index) {
        // 获取每个goods-item的btn的icon
        let addIcon = this.doms.goodsList.children[index].querySelector(".i-jiajiangzujianjiahao");
        
        // 获取icon的位置信息
        let addIconRect = addIcon.getBoundingClientRect();
        // 每次跳跃的起点位置信息
        let addIconRectStart = {
            x: addIconRect.left + addIconRect.width / 2,
            y: addIconRect.top + addIconRect.height / 2
        }

        // 每次调用创建add-to-car
        let div = document.createElement("div");
        div.className = 'add-to-car';
        let i = document.createElement("i");
        i.className = 'iconfont i-jiajiangzujianjiahao';
        div.appendChild(i);

        // 设置动画开始的位置
        div.style.transform = `translate(${addIconRectStart.x}px, ${addIconRectStart.y}px)`;
        document.body.appendChild(div);

        // 强行渲染 【最好使用requestAnimationFrame】
        div.clientHeight;

        // 设置动画结束的位置
        div.style.transform = `translate(${this.cartRectTarget.x}px, ${this.cartRectTarget.y}px`;

        // 过度结束要做的事情
        div.addEventListener("transitionend", () => {
            div.remove();
            this.createAnimate();
        }, {
            once: true, // 事件仅仅触发一次
        })
    }
}

let ui = new UI();

// 事件
ui.doms.goodsList.addEventListener("click", function(e){
    if(e.target.classList.contains("i-jiajiangzujianjiahao")){
        // 调用increase方法
        // 如何拿到index？一开始创建的时候给一个index属性
        let index = +e.target.getAttribute("index");
        ui.increase(index);
    }else if(e.target.classList.contains("i-jianhao")){
        let index = +e.target.getAttribute("index");
        ui.decrease(index);
    }
})