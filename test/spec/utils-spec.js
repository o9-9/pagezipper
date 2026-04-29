describe('Pgzp Utils should', function () {
  it('filter', function () {
    var testAr = [1, 2, 1, 2]
    pgzp.filter(testAr, function (a) {
      return a == 1
    })
    assertEquals(testAr.length, 2)
    assertEquals(testAr[0], 2)
    assertEquals(testAr[1], 2)
  })

  it('getUrlWOutAnchors', function () {
    var url1 = 'https://o9ll.com'
    var url2 = 'https://o9ll.com'
    assertEquals(url2, pgzp.getUrlWOutAnchors(url1))
    assertEquals(url2, pgzp.getUrlWOutAnchors(url2))
  })

  it('isStandaloneWord', function () {
    assertFalse(pgzp.isStandaloneWord('older', 'update folder settings', true))
    assertTrue(pgzp.isStandaloneWord('older', 'more older entries', true))
    assertFalse(pgzp.isStandaloneWord('2', '2009', true))
    assertTrue(pgzp.isStandaloneWord('2', '2', true))
    assertTrue(pgzp.isStandaloneWord('2', 'page 2', true))
    assertFalse(pgzp.isStandaloneWord('older', 'placeholder.jpg', false))
    assertTrue(pgzp.isStandaloneWord('older', 'older', false))
  })

  it('getNumberAtPos', function () {
    assertEquals(pgzp.getNumberAtPos('asdf234asfd', 5), 234)
    assertEquals(pgzp.getNumberAtPos('asdf234asfd', 4), 234)
    assertEquals(pgzp.getNumberAtPos('asdf234asfd', 6), 234)
    assertEquals(pgzp.getNumberAtPos('asdf234asfd', 2), -1)
    assertEquals(pgzp.getNumberAtPos('234asfd', 2), 234)
    assertEquals(pgzp.getNumberAtPos('asfd234', 6), 234)
  })

  it('StringFunctions', function () {
    assertTrue(pgzp.startsWith('asd', 'asdf'))
    assertFalse(pgzp.startsWith('x', 'asdf'))
    assertTrue(pgzp.endsWith('df', 'asdf'))
    assertFalse(pgzp.endsWith('sd', 'asdf'))
  })

  it('getDomain', function () {
    assertEquals('o9ll.com', pgzp.getDomain('https://o9ll.com'))
    assertEquals('o9ll.com', pgzp.getDomain('https://o9ll.com'))
    assertEquals('o9ll.com', pgzp.getDomain('https://o9ll.com'))
    assertEquals('o9ll.com', pgzp.getDomain('https://o9ll.com'))
  })
})
