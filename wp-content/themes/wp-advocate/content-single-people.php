<div class="people-info-left col620" style="margin-left:0">
    <article id="post-<?php the_ID(); ?>" <?php post_class('people-post'); ?>>
    
        <header class="entry-header">
            <h1 class="entry-title"><?php the_title(); ?></h1>
        </header><!-- .entry-header -->
        
        <?php 
		  $job_title = get_post_meta( $post->ID, 'job_title', true ); 
		?>
        <?php if ( ! empty($job_title) ) : ?>
        	<div class="people-job"><?php echo $job_title; ?></div>
        <?php endif; ?>
        
        <div class="people-info-hide">
        	<?php if ( has_post_thumbnail()) : ?>
            <div class="peoplethumb"><?php the_post_thumbnail( array(640, 480) ); ?></div>
            <?php else : ?>
            <?php
            $postimgs =& get_children( array( 'post_parent' => $post->ID, 'post_type' => 'attachment', 'post_mime_type' => 'image', 'orderby' => 'menu_order', 'order' => 'ASC' ) );
            if ( !empty($postimgs) ) {
                $firstimg = array_shift( $postimgs );
                $th_image = wp_get_attachment_image( $firstimg->ID, array(640, 480), false );
             ?>
                <div class="peoplethumb"><a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title_attribute(); ?>"><?php echo $th_image; ?></a></div>
            <?php } else { ?>
                <div class="peoplethumb"><a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title_attribute(); ?>"><img src="<?php echo get_template_directory_uri(); ?>/library/images/profile-default.png" alt="" /></a></div>
            <?php } ?>
        <?php endif; ?>
        <footer class="entry-meta people-foo">
        
        <?php 
		  $phone_number = get_post_meta( $post->ID, 'phone_number', true );
		  $mailto = get_post_meta( $post->ID, 'email', true );
		?>
        
        <?php if ( ! empty($phone_number) ) : ?>
        	<div class="people-phone"><?php echo $phone_number; ?></div>
        <?php endif; ?>
        
        <?php if ( ! empty($mailto) ) : ?>
            <div class="people-email"><a href="<?php _e('mailto:', 'wp-advocate'); echo sanitize_email($mailto); ?>" class="social-em"><?php echo sanitize_email($mailto); ?></a></div>
        <?php endif; ?>
	</footer><!-- #entry-meta -->
        </div>
                
        <div class="entry-content post-content">
			<?php the_content(); ?>
            <?php wp_link_pages( array( 'before' => '<div class="page-link">' . __( 'Pages:', 'wp-advocate' ), 'after' => '</div>' ) ); ?>
            <?php 
			  $linkedin = get_post_meta( $post->ID, 'linkedin', true );
			  $twitter = get_post_meta( $post->ID, 'twitter', true );
			  $facebook = get_post_meta( $post->ID, 'facebook', true );
			  $mailto = get_post_meta( $post->ID, 'email', true );
			  $avvo = get_post_meta( $post->ID, 'avvo', true );
			?>
            
            <div id="social-media" class="people-social clearfix">
				<?php if ( ! empty($linkedin) ) : ?>
                <a href="<?php echo esc_url($linkedin); ?>" class="social-li"><?php _e('LinkedIn', 'wp-advocate') ?></a>
                <?php endif; ?>
                
                <?php if ( ! empty($twitter) ) : ?>
                <a href="<?php echo esc_url($twitter); ?>" class="social-tw"><?php _e('Twitter', 'wp-advocate') ?></a>
                <?php endif; ?>
                
                <?php if ( ! empty($facebook) ) : ?>
                <a href="<?php echo esc_url($facebook); ?>" class="social-fb"><?php _e('Facebook', 'wp-advocate') ?></a>
                <?php endif; ?>
                
                <?php if ( ! empty($avvo) ) : ?>
                <a href="<?php echo esc_url($avvo); ?>" class="social-av"><?php _e('Avvo', 'wp-advocate') ?></a>
                <?php endif; ?>
                
                <?php if ( ! empty($mailto) ) : ?>
                <a href="<?php _e('mailto:', 'wp-advocate'); echo sanitize_email($mailto); ?>" class="social-em"><?php _e('Mailto', 'wp-advocate') ?></a>
                <?php endif; ?>
            </div>
        </div><!-- .entry-content -->
        
    </article><!-- #post-<?php the_ID(); ?> -->
</div>

<div class="people-info-right col300">
	<?php if ( has_post_thumbnail()) : ?>
        <div class="peoplethumb"><?php the_post_thumbnail( array(640, 480) ); ?></div>
        <?php else : ?>
        <?php
        $postimgs =& get_children( array( 'post_parent' => $post->ID, 'post_type' => 'attachment', 'post_mime_type' => 'image', 'orderby' => 'menu_order', 'order' => 'ASC' ) );
        if ( !empty($postimgs) ) {
            $firstimg = array_shift( $postimgs );
            $th_image = wp_get_attachment_image( $firstimg->ID, array(640, 480), false );
         ?>
            <div class="peoplethumb"><a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title_attribute(); ?>"><?php echo $th_image; ?></a></div>
        <?php } else { ?>
			<div class="peoplethumb"><a href="<?php the_permalink() ?>" rel="bookmark" title="<?php the_title_attribute(); ?>"><img src="<?php echo get_template_directory_uri(); ?>/library/images/profile-default.png" alt="" /></a></div>
		<?php } ?>
    <?php endif; ?>
    
	<footer class="entry-meta people-foo">
		<div class="people-name"><?php the_title(); ?></div>
        <?php 
		  $job_title = get_post_meta( $post->ID, 'job_title', true );
		  $phone_number = get_post_meta( $post->ID, 'phone_number', true );
		  $mailto = get_post_meta( $post->ID, 'email', true );
		?>
        <?php if ( ! empty($job_title) ) : ?>
        	<div class="people-job-sm"><?php echo wp_kses_post($job_title); ?></div>
        <?php endif; ?>
        
        <?php if ( ! empty($phone_number) ) : ?>
        	<div class="people-phone"><?php echo $phone_number; ?></div>
        <?php endif; ?>
        
        <?php if ( ! empty($mailto) ) : ?>
            <div class="people-email"><a href="mailto:<?php echo sanitize_email($mailto); ?>" class="social-em"><?php echo sanitize_email($mailto); ?></a></div>
        <?php endif; ?>
	</footer><!-- #entry-meta -->
</div>

<div class="clearfix"></div>
