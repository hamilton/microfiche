import App from './routes/App.svelte';
import { modules } from '../../../standard-modules.config';

const app = new App({
	target: document.body,
	props: {
		namespaces: modules
	}
});

export default app;