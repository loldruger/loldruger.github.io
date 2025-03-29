//@ts-check

const main = async () => {

    const foldingCircles = document.querySelectorAll('.folding-circle');


    for (const circle of foldingCircles) {
        const contentList = circle.parentElement?.parentElement?.querySelector('.content-list');

        circle.addEventListener('click', () => {
            circle.classList.toggle('folded');

            for (const sibling of contentList?.children ?? []) {
                sibling.classList.toggle('rolled-up');
            }

        });
    }

    // for (const button of toggleButtons) {
    //     button.addEventListener('click', () => {
    //         const circle = button.querySelector('svg > circle');
    //         circle.classList.toggle('active');
    //     });
    // }

    // await getLastUpdateDate();

    // const fetcher = new Fetcher();
    // console.log(await fetcher.fetchDataByLocale('ko'));
}

await main();
