import AnimationQueue from "./AnimationQueue";
import animationConfig from "./config";

export default ({
		beforeStart = animationConfig.identity,
		duration = animationConfig.defaultDuration,
		element = animationConfig.element,
		progress: progressCallback = animationConfig.identity
}) => {
	let start = null;
	let stopped = false;
	let animationFrame;
	let stop;
	let animate;

	const promise = new Promise((resolve, reject) => {
		animate = timestamp => {
			start = start || timestamp;

			const timeElapsed = timestamp - start;
			const remaining = duration - timeElapsed;

			if (timeElapsed <= duration) {
				const progress = 1 - remaining / duration; // easing formula (currently linear)
				progressCallback(progress);
				animationFrame = !stopped && requestAnimationFrame(animate);
			} else {
				progressCallback(1);
				resolve();
			}
		};

		stop = () => {
			stopped = true;
			cancelAnimationFrame(animationFrame);
			reject(new Error("animation stopped"));
		};
	}).catch(oReason => oReason);

	AnimationQueue.push(element, _ => {
		beforeStart();
		requestAnimationFrame(animate);

		return new Promise(resolve => {
			promise.then(_ => resolve());
		});
	});

	return {
		promise: _=> promise,
		stop: _ => stop
	};
};