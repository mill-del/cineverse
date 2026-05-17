const { getCurrentWeek, getCurrentYear } = require('../../src/utils/getCurrentWeek')

describe('getCurrentWeek utility', () =>{
    it('should return a number', () =>{
        const week = getCurrentWeek()
        expect(week).toEqual(expect.any(Number))
    })

    it('should return week between 1 and 53', ()=>{
        const week = getCurrentWeek()
        expect(week).toBeGreaterThanOrEqual(1)
        expect(week).toBeLessThanOrEqual(53)
    })
})