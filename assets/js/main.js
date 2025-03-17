const foldingCircles = document.querySelectorAll('.folding-circle');

const main = () => {
    foldingCircles.forEach(circle => {
        circle.addEventListener('click', () => {
            circle.classList.toggle('folded');
        });
    });
}

main();
