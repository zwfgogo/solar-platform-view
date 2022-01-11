import { useState, useEffect } from 'react';
import _ from 'lodash';

export function getWindowSize() {
	let pageWidth = window.innerWidth;
	let pageHeight = window.innerHeight;

	if (typeof pageWidth !== 'number') {
		// 标准模式
		if (document.compatMode === 'CSS1Compat') {
			pageWidth = document.documentElement.clientWidth;
			pageHeight = document.documentElement.clientHeight; // 怪异模式
		} else {
			pageWidth = document.body.clientWidth;
			pageHeight = document.body.clientHeight;
		}
	}
	return {
		pageWidth,
		pageHeight,
	};
}

export function useWindowResize() {
	const size = getWindowSize();
	const [width, setWidth] = useState(size.pageWidth);
	const [height, setHeight] = useState(size.pageHeight);

	const handleResize = _.throttle(e => {
		const size = getWindowSize();
		setWidth(size.pageWidth);
		setHeight(size.pageHeight);
	}, 300);

	useEffect(() => {
		window.addEventListener('resize', handleResize);
		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return { width, height };
}
