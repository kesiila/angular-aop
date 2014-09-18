/* global describe,it,expect,inject,spyOn,afterEach,document */

describe('Angular AOP', function () {
  'use strict';

  it('should define AngularAOP module', function () {
    var module;
    expect(function () {
      module = angular.module('AngularAOP');
    }).not.toThrow();
    expect(typeof module).toBe('object');
  });

  it('should define service called execute with dependencies in "ng"',
    function () {
    var injector = angular.injector(['ng', 'AngularAOP']),
        execute;
    expect(function () {
      execute = injector.get('execute');
    }).not.toThrow();
    expect(typeof execute).toBe('function');
  });

  describe('annotation', function () {

    var module;
    beforeEach(function () {
      module = angular.module('Test', ['AngularAOP']);
    });

    it('should be able to annotate services in the config callback',
      function () {

      var dummyServiceSpyActiveMethod,
          dummyServiceSpyInactiveMethod;

      module.factory('A1', function () {
        return function () {};
      });

      module.factory('A2', function () {
        return function () {};
      });

      module.factory('DummyService', function () {
        var api = {
          active: function () {},
          inactive: function () {}
        };
        dummyServiceSpyActiveMethod =
          spyOn(api, 'active');
        dummyServiceSpyInactiveMethod =
          spyOn(api, 'inactive');
        return api;
      });

      module.config(function (executeProvider, $provide) {
        executeProvider.annotate($provide, {
          'DummyService': [{
            jointPoint: 'before',
            advice: 'A1'
          }]
        });
      });


      var ds = angular.injector(['ng', 'Test']).get('DummyService');
      ds.active();
      expect(dummyServiceSpyActiveMethod).toHaveBeenCalled();
      ds.inactive();
      expect(dummyServiceSpyInactiveMethod).toHaveBeenCalled();

    });

    afterEach(function () {
      angular.bootstrap(document, ['Test']);
    });

  });

  describe('The API', function () {

    beforeEach(function () {
      angular.mock.module('AngularAOP');
    });

    describe('forceObject', function () {

      it('should not wrap function\'s methods if "forceObject"' +
        'property is set to false',

        inject(function (execute) {
        var target = function () {
          targetCalled = true;
        };
        var targetCalled = false;
        target.method = function () {
        };
        target.anotherMethod = function () {
        };
        var parentObj = {};
        parentObj.advice = function () {
        };
        var adviceSpy = spyOn(parentObj, 'advice');
        var aspect = execute(parentObj.advice).around(target, {
          forceObject: false
        });
        aspect.method();
        expect(adviceSpy).not.toHaveBeenCalled();
        expect(targetCalled).toBeFalsy();
        aspect();
        expect(adviceSpy).toHaveBeenCalled();
        expect(targetCalled).toBeTruthy();
      }));


      it('should wrap function\'s methods if "forceObject"' +
        'property is set to true',

        inject(function (execute) {
        var target = function () {
        };
        var targetCalled = false;
        target.method = function () {
          targetCalled = true;
        };
        target.anotherMethod = function () {
        };
        var parentObj = {};
        parentObj.advice = function () {
        };
        var adviceSpy = spyOn(parentObj, 'advice');
        var aspect = execute(parentObj.advice).around(target, {
          forceObject: true
        });
        aspect();
        expect(adviceSpy).not.toHaveBeenCalled();
        expect(targetCalled).toBeFalsy();
        aspect.method();
        expect(adviceSpy).toHaveBeenCalled();
        expect(targetCalled).toBeTruthy();
      }));

    });

  });

});