import {arrayEqual} from '../src/driver';

describe('utils', () => {

  describe('arrayEqual', () => {

    it('should return true when equal', () => {
      expect(
        arrayEqual([
          'a', 'b'
        ], [
          'a', 'b'
        ])
      ).toBe(true)
    });

    it('should return false when not equal', () => {
      expect(
        arrayEqual([
          'a', 'b'
        ], [
          'b', 'c'
        ])
      ).toBe(false)
    });

  });

});
