type Entitlements = {
  maxMessagesPerDay: number;
};

export const entitlementsByThreshold: Entitlements = {
  /*
   * For users with an account
   */
  maxMessagesPerDay: 50,

  /*
   * TODO: For users with an account and a paid membership
   */
};
