document.addEventListener('DOMContentLoaded', function() {
    const addToCartButtons = document.querySelectorAll('addToCartBtn')

    addToCartButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const productId = button.getAttribute('data-productid');
            fetch(`/cart/${productId}`, {
                method: 'POST',
            })
            .then(response => {
                if (response.ok) {
                    console.log("Producto agregado al carrito correctamente ")
                }else{
                    console.error("Error al agregar el producto al carrito ")
                }
            })
            .catch(err => {
                console.error("Error al enviar la solicitus al servidor", error)
            })
        })
    })
})