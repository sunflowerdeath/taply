import { useState, useRef, useEffect, cloneElement } from 'react'

const useLastValue = value => {
	const ref = useRef(value)
	if (ref.current !== value) ref.current = value
	return () => ref.current
}

const useFirstRender = () => {
	const isFirstRender = useRef(true)
	useEffect(() => {
		isFirstRender.current = false
	})
	return isFirstRender.current
}

// `it` is like `this` in class components.
// It has properties `props`, `state` and `setState`, and can be used to store
// any properties.
const useIt = ({ initialCtx, props, initialState }) => {
	const isFirstRender = useFirstRender()
	const ref = useRef(
		typeof initialCtx === 'function' && isFirstRender ? initialCtx() : initialCtx
	)
	const ctx = ref.current
	const getProps = useLastValue(props)
	const [state, setState] = useState(
		typeof initialState === 'function' && isFirstRender
			? initialState(ctx)
			: initialState
	)
	const getState = useLastValue(state)
	if (isFirstRender) {
		Object.defineProperty(ctx, 'props', { get: getProps })
		Object.defineProperty(ctx, 'state', { get: getState })
		Object.defineProperty(ctx, 'setState', {
			value: newState => {
				setState({ ...getState(), ...newState })
			}
		})
	}
	return ctx
}

const mergeRefs = (...refs) => (value) => {
    refs.forEach((ref) => {
        if (ref == null) return
        if (typeof ref === 'function') {
            ref(value)
            return
        }
        try {
            ref.current = value
        } catch (e) {}
    })
}

const cloneElementWithRef = (elem, props, ...children) =>
    cloneElement(
        elem,
        { ...props, ref: mergeRefs(props.ref, elem.ref) },
        ...children
    )

export { useFirstRender, useLastValue, useIt, mergeRefs, cloneElementWithRef }
