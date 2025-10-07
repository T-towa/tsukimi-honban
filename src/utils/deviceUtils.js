// デバイスID関連のユーティリティ関数

/**
 * URLパラメータからdevice_idを取得
 * @returns {string|null} device_id or null
 */
export const getDeviceIdFromURL = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const deviceId = urlParams.get('device_id');

  if (deviceId) {
    // LocalStorageに保存して次回以降も使用可能にする
    localStorage.setItem('device_id', deviceId);
    return deviceId;
  }

  // URLになければLocalStorageから取得
  return localStorage.getItem('device_id');
};

/**
 * LocalStorageに保存されているdevice_idを取得
 * @returns {string|null} device_id or null
 */
export const getStoredDeviceId = () => {
  return localStorage.getItem('device_id');
};

/**
 * device_idをLocalStorageに保存
 * @param {string} deviceId
 */
export const setDeviceId = (deviceId) => {
  if (deviceId) {
    localStorage.setItem('device_id', deviceId);
  }
};

/**
 * device_idをLocalStorageから削除
 */
export const clearDeviceId = () => {
  localStorage.removeItem('device_id');
};

/**
 * device_idが存在するかチェック
 * @returns {boolean}
 */
export const hasDeviceId = () => {
  return !!getDeviceIdFromURL();
};
