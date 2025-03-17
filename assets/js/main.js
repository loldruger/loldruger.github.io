
const main = () => {
    const foldingCircles = document.querySelectorAll('.folding-circle');
    
    for (let circle of foldingCircles) {
        circle.addEventListener('click', () => {
            const contentBody = circle.parentElement.parentElement.querySelectorAll('.content-body');
            circle.classList.toggle('folded');

            for (let sibling of contentBody) {
                sibling.classList.toggle('rolled-up');
            }
        });
    }

}

main();
