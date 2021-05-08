$(async function () {
    let bookInfo = await $.get('book.json');
    for (let i = 0; i < bookInfo.contentpages; i++) {
        $('.swiper-container .swiper-wrapper').append(`<div class="swiper-slide" aria-id="${i}"></div>`);
    }

    var getPageName = function (pageIndex) {
        return 'page' + getPageNumber(pageIndex);
    };

    var getPageNumber = function (pageIndex) {
        return ('000' + (pageIndex + 1)).substr(-3);
    }

    var loadPage = async function (pageIndex) {
        let $activePage = $(`.swiper-slide-active`);
        if ($activePage.find('img').length) return;

        let pageInfo = await $.get(`pages/${getPageName(pageIndex)}.json`);
        $activePage.append(`<img src="images/${pageInfo.background[0].file}">`);

        var k = $('body').width() / 1094 * 2;

        if (pageInfo.translate && pageInfo.translate.length) {
            pageInfo.translate.filter(t => t.isCR).forEach(t => {
                $activePage
                    .append('<a class="play">').children(':last-child')
                    .css({
                        left: t.x * k,
                        top: t.y * k,
                        width: t.width * k,
                        height: t.height * k,
                        borderRadius: t.height * k,
                    })
                    .data({ mp3: t.cid + ".mp3", cid: t.cid });
            });
        }

        if (pageInfo.clickRead && pageInfo.clickRead.length) {
            pageInfo.clickRead.filter(t => t.text.endsWith('.mp3')).forEach(t => {
                $activePage
                    .append('<a class="play">').children(':last-child')
                    .css({
                        left: t.x * k,
                        top: t.y * k,
                        width: t.width * k,
                        height: t.height * k,
                        borderRadius: t.height * k,
                    }).data({ mp3: t.text, cid: t.cid });
            });
        }

        if (pageInfo.menu && pageInfo.menu.length) {
            pageInfo.menu.forEach(t => {
                $activePage
                    .append('<a class="play circle">').children(':last-child')
                    .css({
                        left: t.x * k,
                        top: t.y * k,
                        fontSize: '5vw',
                    }).text('♬').data({ mp3: t.item[0].file, cid: t.cid });
            });
        }
    }

    $(document).on('click', 'a.play', async function () {
        let data = $(this).data();
        console.log(data);
        let audio = document.querySelector('audio');
        audio.pause();
        audio.src = `audios/${data.mp3}`;
        audio.currentTime = 0;
        audio.play();

        if ($(this).is('.play.circle')) {
            $('p.translate').html('');
        } else {
            var translate = await $.get(`translates/${data.cid}.json`);
            $('p.translate').html(translate.description);
        }
    });

    var swiper = new Swiper('.swiper-container', {
        loop: false,
        init: true,
        initSlide: 1,
        on: {
            init: function () {
                console.log(`Swiper.init ${this.activeIndex}`);
                loadPage(this.activeIndex);
            },
            slideChangeTransitionEnd: function () {
                console.log(`Swiper.slideChangeTransitionEnd ${this.activeIndex}`);
                loadPage(this.activeIndex);
            },
        },
    });
});