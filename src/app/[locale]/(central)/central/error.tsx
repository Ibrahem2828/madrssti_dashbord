"use client"; import {ErrorState} from "@/components/feedback/states"; export default function Error({reset}:{reset:()=>void}){return <ErrorState onRetry={reset}/>}
