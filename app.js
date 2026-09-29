const products=[...document.querySelectorAll('[data-product]')];
const filters=[...document.querySelectorAll('[data-filter]')];
const count=document.querySelector('[data-cart-count]');
const total=document.querySelector('[data-cart-total]');
const drawer=document.querySelector('[data-cart]');
const list=document.querySelector('[data-cart-list]');
let cart=[];

function render(){
  count.textContent=cart.length;
  total.textContent='R$ '+cart.reduce((sum,item)=>sum+item.price,0).toFixed(2).replace('.',',');
  list.innerHTML=cart.length?cart.map((item,index)=>'<li><span>'+item.name+'</span><button data-remove="'+index+'">remover</button></li>').join(''):'<li>Seu carrinho está vazio.</li>';
  list.querySelectorAll('[data-remove]').forEach(button=>button.onclick=()=>{cart.splice(Number(button.dataset.remove),1);render()});
}
filters.forEach(button=>button.onclick=()=>{
  filters.forEach(item=>item.classList.remove('active'));button.classList.add('active');
  products.forEach(card=>card.classList.toggle('hide',button.dataset.filter!=='all'&&card.dataset.category!==button.dataset.filter));
});
document.querySelectorAll('[data-add]').forEach(button=>button.onclick=()=>{
  cart.push({name:button.dataset.name,price:Number(button.dataset.price)});render();drawer.classList.add('open');
});
document.querySelector('[data-open-cart]').onclick=()=>drawer.classList.add('open');
document.querySelector('[data-close-cart]').onclick=()=>drawer.classList.remove('open');
document.querySelector('[data-checkout]').onclick=()=>document.querySelector('[data-cart-message]').textContent='Demonstração: checkout iniciado. Em produção, esta etapa integraria pagamento, frete e estoque.';
render();

// portfolio-polish-2026-09-29
const openCart=()=>{drawer.classList.add('open');document.body.classList.add('cart-open');document.querySelector('[data-close-cart]')?.focus()};
const closeCart=()=>{drawer.classList.remove('open');document.body.classList.remove('cart-open')};
document.querySelectorAll('[data-add]').forEach(button=>button.addEventListener('click',()=>document.body.classList.add('cart-open')));
document.querySelector('[data-open-cart]')?.addEventListener('click',()=>{document.body.classList.add('cart-open')});
document.querySelector('[data-close-cart]')?.addEventListener('click',closeCart);
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&drawer.classList.contains('open'))closeCart()});
document.addEventListener('pointerdown',event=>{if(document.body.classList.contains('cart-open')&&!drawer.contains(event.target)&&!event.target.closest('[data-open-cart],[data-add]'))closeCart()});
