import { ActionOptions, applyParams, save } from "gadget-server";

export const run = async (
  { params, record, logger, api, connections }: any,
) => {
  applyParams(params, record);
  await save(record);
};

export const onSuccess = async (
  { params, record, logger, api, connections }: any,
) => {
  try {
    logger.info({ shopId: record.id }, "Installing web pixel for shop");
    
    await api.installWebPixel();
    
    logger.info({ shopId: record.id }, "Web pixel successfully installed for shop");
  } catch (error) {
    logger.error({ shopId: record.id, error: error.message }, "Failed to install web pixel for shop");
    // Don't throw the error to avoid breaking the shop installation
  }
};

export const options: ActionOptions = { actionType: "create" };
