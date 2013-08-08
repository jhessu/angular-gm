'use strict';

/**
 * @ngdoc directive
 * @name angulargm.directive:gmMap
 * @element ANY
 * 
 * @description
 * A directive for embedding google maps into your app. 
 *
 * `gm-map-id` is required. The `gm-center`, `gm-zoom`, `gm-bounds`, and
 * `gm-map-type-id` variables do not have to exist in the current scope--they
 * will be created if necessary. All three have bi-directional association,
 * i.e.  drag or zoom the map and they will update, update them and the map
 * will change.  However, any initial state of these three variables will be
 * ignored.
 *
 * If you need to get a handle on the google.maps.Map object, see
 * [angulargmContainer]
 *
 * @param {expression} gm-map-id angular expression that evaluates to a unique
 * string id for the map, e.g. `'map_canvas'` or `myMapId` where myMapId is a
 * variable in the current scope. This allows you to have multiple
 * maps/instances of the directive.
 *
 *
 * @param {expression} gm-center center variable in the current scope.  The
 * value will be a google.maps.LatLng object.
 *
 *
 * @param {expression} gm-zoom zoom variable in the current scope.  Value will
 * be an integer.
 *
 *
 * @param {expression} gm-bounds bounds variable in the current scope.  Value
 * will be a google.maps.LatLngBounds object.
 *
 *
 * @param {expression} gm-map-type-id mapTypeId variable in the current scope.
 * Value will be a string.
 *
 *
 * @param {expression} gm-map-options object in the current scope that is a
 * google.maps.MapOptions object. If unspecified, will use the values in
 * angulargmDefaults.mapOptions. [angulargmDefaults] is a service, so it is
 * both injectable and overrideable (using $provide.decorator).
 *
 */

/**
 * @ngdoc event
 * @name angulargm.directive:gmMap#gmMapResize
 * @eventOf angulargm.directive:gmMap
 * @eventType listen on current gmMap scope
 * @param {string} mapId Required. The id of your map.
 * @example
 * ```js
 * $scope.$broadcast('gmMapResize', 'myMapId')
 * ```
 */

(function () {
  angular.module('AngularGM').

  directive('gmMap', ['$timeout', function ($timeout) {
  
    /** link function **/

    function link(scope, element, attrs, controller) {
      // initialize scope
      if (!angular.isDefined(scope.gmCenter)) {
        scope.center = {};
      }
      if (!angular.isDefined(scope.gmBounds)) {
        scope.bounds = {};
      }

      // Make sure gmMapId is defined
      // Note: redundant check in MapController. Can't hurt.
      if (!angular.isDefined(scope.gmMapId)) {
        throw 'angulargm must have non-empty gmMapId attribute';
      }

      // Check what's defined in attrs
      // Note: this is also redundant since angular will throw an exception if
      // these attributes are not set. I may make these optional in the future
      // (pending angular support).
      var hasCenter = false;
      var hasZoom = false;
      var hasBounds = false;
      var hasMapTypeId = false;

      if (attrs.hasOwnProperty('gmCenter')) {
        hasCenter = true;
      }
      if (attrs.hasOwnProperty('gmZoom')) {
        hasZoom = true;
      }
      if (attrs.hasOwnProperty('gmBounds')) {
        hasBounds = true;
      }
      if (attrs.hasOwnProperty('gmMapTypeId')) {
        hasMapTypeId = true;
      }

      var updateScope = function() {
        $timeout(function () {
          if (hasCenter || hasZoom || hasBounds || hasMapTypeId) {
            scope.$apply(function (s) {
              if (hasCenter) {
                scope.gmCenter = controller.center;
              }
              if (hasZoom) {
                scope.gmZoom = controller.zoom;
              }
              if (hasBounds) {
                var b = controller.bounds;
                if (b) {
                  scope.gmBounds = b;
                }
              }
              if (hasMapTypeId) {
                scope.gmMapTypeId = controller.mapTypeId;
              }
            });
          }
        });
      };

      controller.addMapListener('drag', updateScope);
      controller.addMapListener('zoom_changed', updateScope);
      controller.addMapListener('center_changed', updateScope);
      controller.addMapListener('bounds_changed', updateScope);
      controller.addMapListener('maptypeid_changed', updateScope);
      controller.addMapListener('resize', updateScope);
      
      if (hasCenter) {
        scope.$watch('gmCenter', function (newValue, oldValue) {
          var changed = (newValue !== oldValue);
          if (changed && !controller.dragging) {
            var latLng = newValue;
            if (latLng)
              controller.center = latLng;
          }
        }, true);
      }
      
      if (hasZoom) {
        scope.$watch('gmZoom', function (newValue, oldValue) {
          var ok = (newValue != null && !isNaN(newValue));
          if (ok && newValue !== oldValue) {
            controller.zoom = newValue;
          }
        });
      }

      if (hasBounds) {
        scope.$watch('gmBounds', function(newValue, oldValue) {
          var changed = (newValue !== oldValue);
          if (changed && !controller.dragging) {
            var bounds = newValue;
            if (bounds)
              controller.bounds = bounds; 
          }
        });
      }

      if (hasMapTypeId) {
        scope.$watch('gmMapTypeId', function(newValue, oldValue) {
          var changed = (newValue !== oldValue);
          if (changed && newValue) {
            controller.mapTypeId = newValue;
          }
        });
      }

      scope.$on('gmMapResize', function(event, gmMapId) {
        if (scope.gmMapId() === gmMapId) {
          controller.mapTrigger('resize');
        }
      });
    }


    return {
      restrict: 'AE',
      priority: 100,
      template: '<div>' + 
                  '<div id="" style="width:100%;height:100%;"></div>' + 
                  '<div ng-transclude></div>' + 
                '</div>',
      transclude: true,
      replace: true,
      scope: {
        gmCenter: '=',
        gmZoom: '=',
        gmBounds: '=',
        gmMapTypeId: '=',
        gmMapOptions: '&',
        gmMapId: '&'
      },
      controller: 'angulargmMapController',
      link: link
    };
  }]);
})();
