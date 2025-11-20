/**
 * Event Bus
 * Pub/sub event system for GlyphCase
 */

import type { EventHandler, Subscriber, UnsubscribeFn } from './types';

export class EventBus {
  private subscribers: Map<string, Subscriber[]> = new Map();
  private eventId = 0;

  /**
   * Emit an event to all subscribers
   */
  emit(event: string, data: any): void {
    const subs = this.subscribers.get(event);
    if (!subs) return;

    // Filter out 'once' subscribers after calling
    const toRemove: string[] = [];

    for (const sub of subs) {
      try {
        sub.handler(data);

        if (sub.once) {
          toRemove.push(sub.id);
        }
      } catch (error) {
        console.error(`[EventBus] Error in handler for '${event}':`, error);
      }
    }

    // Remove 'once' subscribers
    if (toRemove.length > 0) {
      this.subscribers.set(
        event,
        subs.filter(s => !toRemove.includes(s.id))
      );
    }
  }

  /**
   * Subscribe to an event
   */
  on(event: string, handler: EventHandler): UnsubscribeFn {
    const subscriber: Subscriber = {
      id: `sub-${++this.eventId}`,
      handler,
      once: false
    };

    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    this.subscribers.get(event)!.push(subscriber);

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(event);
      if (subs) {
        this.subscribers.set(
          event,
          subs.filter(s => s.id !== subscriber.id)
        );
      }
    };
  }

  /**
   * Subscribe once to an event (auto-unsubscribe after first call)
   */
  once(event: string, handler: EventHandler): void {
    const subscriber: Subscriber = {
      id: `sub-${++this.eventId}`,
      handler,
      once: true
    };

    if (!this.subscribers.has(event)) {
      this.subscribers.set(event, []);
    }

    this.subscribers.get(event)!.push(subscriber);
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, handler?: EventHandler): void {
    if (!handler) {
      // Remove all subscribers for this event
      this.subscribers.delete(event);
      return;
    }

    const subs = this.subscribers.get(event);
    if (!subs) return;

    this.subscribers.set(
      event,
      subs.filter(s => s.handler !== handler)
    );
  }

  /**
   * Get subscriber count for an event
   */
  count(event: string): number {
    return this.subscribers.get(event)?.length ?? 0;
  }

  /**
   * Clear all subscribers
   */
  clear(): void {
    this.subscribers.clear();
  }
}
