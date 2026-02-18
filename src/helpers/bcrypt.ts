class BcryptHelper {
	private static _instance: BcryptHelper;

	private constructor() {}

	static get instance() {
		if (!BcryptHelper._instance) {
			BcryptHelper._instance = new BcryptHelper();
		}
		return BcryptHelper._instance;
	}

	async hash(plain: string): Promise<string> {
		return await Bun.password.hash(plain);
	}

	async compare(plain: string, hashed: string): Promise<boolean> {
		return await Bun.password.verify(plain, hashed);
	}
}

const bcryptHelper = BcryptHelper.instance;
export default bcryptHelper;
