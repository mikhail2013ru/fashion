$('.carousel').carousel({
    interval: 2000
})

//let link = document.querySelectorAll('.nav .list__link');
let discount = document.getElementById('discount');
let button = document.querySelector('.button1');

console.log(button);

button.addEventListener('click', function(event) {
    discount.scrollIntoView({
        'behavior': 'smooth',
    });
});
//console.log(link[0]);