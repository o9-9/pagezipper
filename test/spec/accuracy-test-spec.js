//This is a big array of urls and the correct next url
//all the pages must be saved to /accuracy_test/pages
//add new pages with wget -O <filename> -k <url>
//order is [page_file_name, next_url, current_url
var bigUrlsArray = [
  [
    'nytimes.html',
    'https://nytimes.com/slideshow/2008/10/30/travel/escapes/1031-AMERICAN_10.html',
    'https://nytimes.com/slideshow/2008/10/30/travel/escapes/1031-AMERICAN_9.html'
  ],
  [
    'icanhascheezburger.html',
    'https://dogs.icanhascheezburger.com/page/2/',
    'https://dogs.icanhascheezburger.com/'
  ],
  ['makeuseof.html', 'https://makeuseof.com/page/2/', 'https://makeuseof.com/'],
  [
    'redferret.html',
    'https://redferret.net/?paged=2',
    'https://redferret.net/'
  ],
  [
    'freecycle.html',
    'https://groups.freecycle.org/Desmoinesfreecycle/posts/all?page=3&resultsperpage=10&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off',
    'https://groups.freecycle.org/Desmoinesfreecycle/posts/all?page=2&resultsperpage=10&showall=off&include_offers=off&include_wanteds=off&include_receiveds=off&include_takens=off'
  ],
  [
    'time.html',
    'https://time.com/time/specials/2007/article/0,28804,1809858_1809957_1811552,00.html',
    'https://time.com/time/specials/2007/article/1,28804,1809858_1809957,00.html'
  ],
  [
    'actionsquad.html',
    'https://actionsquad.org/hammshist.htm',
    'https://actionsquad.org/hammsoverview.htm'
  ],
  [
    'treehugger.html',
    'https://treehugger.com/files/2009/04/17-examples-of-pedal-power-and-propulsion.php?page=2',
    'https://treehugger.com/files/2009/04/17-examples-of-pedal-power-and-propulsion.php'
  ],
  [
    'eurogamer.html',
    'https://eurogamer.net/articles/2010-11-13-the-men-who-stare-at-protoss-article?page=2',
    'https://eurogamer.net/'
  ],
  [
    'bw.html',
    'https://images.businessweek.com/ss/10/01/0119_most_expensive_small_towns/3.htm',
    'https://images.businessweek.com/ss/10/01/0119_most_expensive_small_towns/2.htm'
  ],
  [
    'photoshopessentials.html',
    'https://photoshopessentials.com/photo-effects/photo-borders-photoshop-brushes/page-2.php',
    'https://photoshopessentials.com/photo-effects/photo-borders-photoshop-brushes/'
  ],
  [
    'howstuffworks1.html',
    'https://electronics.howstuffworks.com/gadgets/travel/gps1.htm',
    'https://electronics.howstuffworks.com/gadgets/travel/gps.htm'
  ],
  [
    'howstuffworks2.html',
    'https://electronics.howstuffworks.com/gadgets/travel/gps4.htm',
    'https://electronics.howstuffworks.com/gadgets/travel/gps3.htm'
  ],
  [
    'leboncoin.html',
    'https://leboncoin.fr/instruments_de_musique/offres/provence_alpes_cote_d_azur/var/?o=4',
    'https://leboncoin.fr/instruments_de_musique/offres/provence_alpes_cote_d_azur/var/?o=3'
  ],
  [
    'amazon-category.html',
    'https://www.amazon.com/Best-Sellers-Electronics-Computer-Audio-Video-Accessories/zgbs/electronics/11548951011/ref=zg_bs_11548951011_pg_2?_encoding=UTF8&pg=2',
    'https://www.amazon.com/Best-Sellers-Electronics-Computer-Audio-Video-Accessories/zgbs/electronics/11548951011/ref=zg_bs_11548951011_pg_1?_encoding=UTF8&pg=1'
  ],
  [
    'gallery.html',
    'https://localhost/gallery/henrieke/2/',
    'https://localhost/gallery/henrieke/'
  ]
]

describe('Verify pages continue working after changes', function () {
  it(
    'no regressions',
    function (done) {
      var testPage = function (pageUrl, nextUrl, startUrl) {
        _initWithPage(startUrl)
        readInPageBody('accuracy_test/' + pageUrl, function (pageBody) {
          preparePage(pageBody, startUrl)
          var nextLinkObj = pgzp.getNextLink(pageBody)
          var resultUrl = nextLinkObj ? nextLinkObj.url : null
          expect(resultUrl).toBe(nextUrl)
          document.querySelector('#console').innerHTML +=
            `${pageUrl} => expected: ${nextUrl} got: ${resultUrl}<br/>`
          runTest()
        })
      }

      var runTest = function () {
        console.log('bigarraylength: ' + bigUrlsArray.length)
        if (bigUrlsArray.length === 0) {
          done()
          return
        }

        var curr_site = bigUrlsArray.shift()
        console.log(
          'Running test: ' +
            curr_site[0] +
            ' # remaining tests to run: ' +
            bigUrlsArray.length
        )
        testPage(curr_site[0], curr_site[1], curr_site[2])
      }

      runTest()
    },
    5000 * bigUrlsArray.length
  ) //set timeout
})
