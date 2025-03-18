
const main = () => {
    const foldingCircles = document.querySelectorAll('.folding-circle');
    
    for (const circle of foldingCircles) {
        circle.addEventListener('click', () => {
            const contentBody = circle.parentElement.parentElement.querySelectorAll('.content-list > .content-body');
            circle.classList.toggle('folded');

            for (const sibling of contentBody) {
                sibling.classList.toggle('rolled-up');
            }
        });
    }
}

main();
