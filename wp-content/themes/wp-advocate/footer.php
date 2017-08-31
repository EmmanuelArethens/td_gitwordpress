	
	</div><!-- #container -->
    
	<div class="push"></div>
    
</div><!-- #wrapper -->

<footer id="colophon" role="contentinfo">
    <div id="site-generator">

        <?php echo __('&copy; ', 'wp-advocate') . esc_attr( get_bloginfo( 'name', 'display' ) );  ?>
        <?php if ( is_front_page() && ! is_paged() ) : ?>
        <?php _e('- Powered by ', 'wp-advocate'); ?><a href="<?php echo esc_url( __( 'http://wordpress.org/', 'wp-advocate' ) ); ?>" title="<?php esc_attr_e( 'Semantic Personal Publishing Platform', 'wp-advocate' ); ?>"><?php _e('WordPress.' ,'wp-advocate'); ?></a>
        <?php _e(' Theme by ', 'wp-advocate'); ?><a href="<?php echo esc_url( __( 'http://wpdevshed.com/', 'wp-advocate' ) ); ?>"><?php _e('WP Dev Shed', 'wp-advocate'); ?></a>
        <?php endif; ?>
        <?php wp_advocate_footer_nav(); ?>
        
    </div>
</footer><!-- #colophon -->

<?php wp_footer(); ?>


</body>
</html>