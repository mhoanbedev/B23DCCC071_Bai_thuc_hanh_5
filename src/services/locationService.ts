import Geolocation, { GeolocationError, GeolocationResponse } from '@react-native-community/geolocation';
import { PermissionsAndroid, Platform } from 'react-native';

import { GeoPoint } from '../types/models';

export class LocationError extends Error {
  constructor(public readonly reason: 'denied' | 'unavailable' | 'timeout') {
    super(reason);
  }
}

Geolocation.setRNConfiguration({
  skipPermissionRequests: true,
  authorizationLevel: 'whenInUse',
  locationProvider: 'auto',
});

async function ensurePermission(): Promise<boolean> {
  if (Platform.OS !== 'android') {
    return new Promise(resolve => {
      Geolocation.requestAuthorization(
        () => resolve(true),
        () => resolve(false),
      );
    });
  }
  const granted = await PermissionsAndroid.requestMultiple([
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  return Object.values(granted).some(result => result === PermissionsAndroid.RESULTS.GRANTED);
}

function readPosition(enableHighAccuracy: boolean, timeout: number): Promise<GeolocationResponse> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy,
      timeout,
      maximumAge: 60 * 1000,
    });
  });
}

function toLocationError(error: GeolocationError): LocationError {
  if (error.code === error.PERMISSION_DENIED) {
    return new LocationError('denied');
  }
  if (error.code === error.TIMEOUT) {
    return new LocationError('timeout');
  }
  return new LocationError('unavailable');
}

export async function getCurrentLocation(): Promise<GeoPoint> {
  const allowed = await ensurePermission();
  if (!allowed) {
    throw new LocationError('denied');
  }
  let position: GeolocationResponse;
  try {
    position = await readPosition(true, 10000);
  } catch (error) {
    const typed = error as GeolocationError;
    if (typed.code === typed.PERMISSION_DENIED) {
      throw toLocationError(typed);
    }
    try {
      position = await readPosition(false, 15000);
    } catch (fallbackError) {
      throw toLocationError(fallbackError as GeolocationError);
    }
  }
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    accuracy: position.coords.accuracy,
  };
}

export function getLocationErrorMessage(error: unknown): string {
  if (error instanceof LocationError) {
    if (error.reason === 'denied') {
      return 'Ứng dụng chưa được cấp quyền truy cập vị trí. Hãy bật quyền vị trí trong Cài đặt của điện thoại.';
    }
    if (error.reason === 'timeout') {
      return 'Không lấy được vị trí kịp thời. Hãy kiểm tra GPS rồi thử lại.';
    }
  }
  return 'Không xác định được vị trí hiện tại. Hãy bật GPS rồi thử lại.';
}
