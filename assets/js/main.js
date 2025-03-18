const main = () => {
    const foldingCircles = document.querySelectorAll('.folding-circle');
    
    for (const circle of foldingCircles) {
        const contentList = circle.parentElement.parentElement.querySelector('.content-list');

        circle.addEventListener('click', () => {
            circle.classList.toggle('folded');

            for (const sibling of contentList.children) {
                sibling.classList.toggle('rolled-up');
            }
  
        });
    }
}

main();
